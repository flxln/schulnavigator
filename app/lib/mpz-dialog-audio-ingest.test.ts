import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import { createMpzContentIo } from '@/lib/mpz-content-io'
import {
  auditDialogAudio,
  deriveSegmentState,
  ingestDialogClip,
  resetDialogIngestLockForTests,
  validateDialogWavUpload,
} from '@/lib/mpz-dialog-audio-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile

function pad(b: Buffer, min = 1024): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, min - b.length), 0x20)])
}

const WAV_A = pad(
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0x24, 0, 0, 0]),
    Buffer.from('WAVEfmt '),
    Buffer.from('CLIP-A'),
  ]),
)

const WAV_B = pad(
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0x24, 0, 0, 0]),
    Buffer.from('WAVEfmt '),
    Buffer.from('CLIP-B-OTHER'),
  ]),
)

const MP3_STUB = pad(Buffer.from([0xff, 0xfb, 0x90, 0x44, 0, 0, 0, 0]))

function setupTempApp(stations: StationsFile = structuredClone(fixture)): string {
  const root = mkdtempSync(join(tmpdir(), 'mpz-dialog-'))
  mkdirSync(join(root, 'data'), { recursive: true })
  writeFileSync(join(root, 'data', 'stations.json'), JSON.stringify(stations, null, 2))
  mkdirSync(join(root, 'content', 'dialog-audio', 'daz'), { recursive: true })
  return root
}

function dazStation(stations: StationsFile) {
  const st = stations.stations.find((s) => s.slug === 'daz')
  if (!st?.dialog) throw new Error('daz fixture fehlt')
  return st
}

describe('mpz-dialog-audio-ingest · deriveSegmentState', () => {
  it('deckt alle 4 Kombinationen ab (P5)', () => {
    expect(deriveSegmentState(true, true)).toBe('ok')
    expect(deriveSegmentState(false, true)).toBe('leer')
    expect(deriveSegmentState(true, false)).toBe('drift')
    expect(deriveSegmentState(false, false)).toBe('fehlt')
  })
})

describe('mpz-dialog-audio-ingest · validateDialogWavUpload', () => {
  it('lehnt mp3 ab (P7)', async () => {
    await expect(
      validateDialogWavUpload({
        headerSlice: MP3_STUB.subarray(0, 64),
        byteLength: MP3_STUB.length,
        originalName: 'x.mp3',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('lehnt LFS-Pointer ab (P7)', async () => {
    const ptr = Buffer.from('version https://git-lfs.github.com/spec/v1\n')
    await expect(
      validateDialogWavUpload({
        headerSlice: ptr,
        byteLength: ptr.length,
        originalName: 'x.wav',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('mpz-dialog-audio-ingest · ingestDialogClip', () => {
  let root: string

  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  afterEach(() => {
    resetDialogIngestLockForTests()
    if (root) rmSync(root, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('schreibt WAV + aktualisiert quelle (Segment 0)', async () => {
    root = setupTempApp()
    const io = createMpzContentIo({ appRoot: root })
    const result = await ingestDialogClip(
      {
        slug: 'daz',
        segmentIndex: 0,
        source: { buffer: WAV_A },
        originalName: 'airdrop.wav',
        collision: 'replace',
      },
      io,
    )
    expect(result.quelle).toBe('/api/dialog/daz/01-frieda.wav')
    expect(readFileSync(result.destPath).equals(WAV_A)).toBe(true)
    const data = JSON.parse(readFileSync(join(root, 'data', 'stations.json'), 'utf8')) as StationsFile
    const daz = dazStation(data)
    expect(daz.dialog?.segmente[0].quelle).toBe(result.quelle)
    expect(result.destPath).toBe(join(root, 'content', 'dialog-audio', 'daz', '01-frieda.wav'))
  })

  it('reject bei existierender Datei', async () => {
    root = setupTempApp()
    const clipPath = join(root, 'content', 'dialog-audio', 'daz', '01-frieda.wav')
    writeFileSync(clipPath, WAV_A)
    const io = createMpzContentIo({ appRoot: root })
    await expect(
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 0,
          source: { buffer: WAV_B },
          originalName: 'x.wav',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('DRIFT ohne override → VALIDATION (P5)', async () => {
    const stations = structuredClone(fixture)
    const daz = dazStation(stations)
    daz.dialog!.segmente[1].quelle = '/api/dialog/daz/99-custom.wav'
    root = setupTempApp(stations)
    const io = createMpzContentIo({ appRoot: root })
    await expect(
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 1,
          source: { buffer: WAV_A },
          originalName: 'x.wav',
          collision: 'replace',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('replace stellt alte WAV nach JSON-Fehler wieder her (P2)', async () => {
    root = setupTempApp()
    const clipPath = join(root, 'content', 'dialog-audio', 'daz', '01-frieda.wav')
    writeFileSync(clipPath, WAV_A)
    const io = createMpzContentIo({ appRoot: root })
    vi.spyOn(io, 'writeStations').mockRejectedValueOnce(new Error('JSON fail'))
    await expect(
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 0,
          source: { buffer: WAV_B },
          originalName: 'x.wav',
          collision: 'replace',
        },
        io,
      ),
    ).rejects.toThrow('JSON fail')
    expect(readFileSync(clipPath).equals(WAV_A)).toBe(true)
  })

  it('parallele Uploads verschiedener Segmente landen beide in JSON (P3)', async () => {
    root = setupTempApp()
    const io = createMpzContentIo({ appRoot: root })
    await Promise.all([
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 0,
          source: { buffer: WAV_A },
          originalName: 'a.wav',
          collision: 'replace',
        },
        io,
      ),
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 1,
          source: { buffer: WAV_B },
          originalName: 'b.wav',
          collision: 'replace',
        },
        io,
      ),
    ])
    const data = JSON.parse(readFileSync(join(root, 'data', 'stations.json'), 'utf8')) as StationsFile
    const daz = dazStation(data)
    expect(daz.dialog?.segmente[0].quelle).toBe('/api/dialog/daz/01-frieda.wav')
    expect(daz.dialog?.segmente[1].quelle).toBe('/api/dialog/daz/02-otto.wav')
  })
})

describe('mpz-dialog-audio-ingest · auditDialogAudio', () => {
  it('erkennt orphans und states', () => {
    const root = mkdtempSync(join(tmpdir(), 'mpz-audit-'))
    try {
      const stations = structuredClone(fixture)
      const daz = dazStation(stations)
      daz.dialog!.segmente[1].quelle = '/extern/clip.wav'
      const dir = join(root, 'content', 'dialog-audio', 'daz')
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, '01-frieda.wav'), WAV_A)
      writeFileSync(join(dir, 'orphan-extra.wav'), WAV_B)
      const { segments, orphans } = auditDialogAudio(daz, root)
      expect(segments[0].state).toBe('ok')
      expect(segments[1].state).toBe('fehlt')
      expect(orphans).toContain('orphan-extra.wav')
      expect(segments[0].textPreview.length).toBeLessThanOrEqual(61)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
