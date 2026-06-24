import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import rawStations from '@/data/stations.json'
import {
  createMpzContentIo,
  MpzContentIoError,
  resetMpzWriteLockForTests,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import { replaceStationMediumFile } from '@/lib/mpz-medium-replace'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'
import { studioDemoStationsFile } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

const fixture = studioDemoStationsFile(rawStations as StationsFile)

function pad(b: Buffer, n = 64): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, n - b.length))])
}

const MP3_OLD = pad(Buffer.from('OLD-AUDIO-CONTENT----------------'))
const MP3_NEW = pad(Buffer.from([0xff, 0xfb, 0x90, 0x44, 0, 0, 0, 0]))
const JPEG = pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]))
const MP4 = pad(
  Buffer.concat([
    Buffer.from([0, 0, 0, 0x18]),
    Buffer.from('ftypisom'),
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('isommp42'),
  ]),
)
const TEXT_OLD = Buffer.from('Alte Notiz', 'utf8')
const TEXT_MD = Buffer.from('# Neue Notiz\n\nMarkdown.', 'utf8')

const temps: string[] = []

function seedFile(appRoot: string, quelle: string, content: Buffer): string {
  const filePath = join(appRoot, 'public', quelle.slice(1))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content)
  return filePath
}

function makeIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-replace-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  const io = createMpzContentIo({ appRoot })
  writeFileSync(io.getPaths().stationsPath, serializeStationsFile(initial), 'utf8')
  return io
}

function readStationsFile(io: ReturnType<typeof createMpzContentIo>): StationsFile {
  return JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
}

describe('mpz-medium-replace · replaceStationMediumFile', () => {
  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetMpzWriteLockForTests()
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  it('ersetzt Audio MP3 in-place: quelle gleich, Inhalt neu, id stabil', async () => {
    const io = makeIo()
    const quelle = '/media/klassenzimmer/audio/grundschule_demo.mp3'
    const filePath = seedFile(io.getPaths().appRoot, quelle, MP3_OLD)

    const result = await replaceStationMediumFile(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-audio',
        source: { buffer: MP3_NEW },
        originalName: 'anderer-name.mp3',
      },
      io,
    )

    expect(result.quelle).toBe(quelle)
    expect(result.previousQuelle).toBe(quelle)
    expect(result.fileReplaced).toBe(true)
    expect(result.previousFileDeleted).toBe(false)
    expect(result.medium.id).toBe('demo-audio')
    expect(readFileSync(filePath)).toEqual(MP3_NEW)

    const data = readStationsFile(io)
    const station = data.stations.find((s) => s.slug === 'klassenzimmer')!
    const hotspot = station.hotspots360?.find((hs) => hs.mediumId === 'demo-audio')
    expect(hotspot?.mediumId).toBe('demo-audio')
  })

  it('wechselt Text .txt → .md und löscht alte Datei', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const klassenzimmer = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const textMedium = klassenzimmer.medien.find((m) => m.id === 'demo-text')!
    textMedium.quelle = '/media/klassenzimmer/texte/notes.txt'

    const io = makeIo(custom)
    const oldQuelle = '/media/klassenzimmer/texte/notes.txt'
    seedFile(io.getPaths().appRoot, oldQuelle, TEXT_OLD)

    const result = await replaceStationMediumFile(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-text',
        source: { buffer: TEXT_MD },
        originalName: 'notes.md',
      },
      io,
    )

    expect(result.quelle).toBe('/media/klassenzimmer/texte/notes.md')
    expect(result.previousQuelle).toBe(oldQuelle)
    expect(result.previousFileDeleted).toBe(true)
    expect(existsSync(join(io.getPaths().appRoot, 'public', oldQuelle.slice(1)))).toBe(false)
    expect(
      existsSync(join(io.getPaths().appRoot, 'public', 'media/klassenzimmer/texte/notes.md')),
    ).toBe(true)
  })

  it('nutzt -2-Suffix bei Endungswechsel-Pfadkollision', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'text-a',
        typ: 'text',
        quelle: '/media/hort/texte/notes.txt',
        untertitel: 'A',
      },
      {
        id: 'text-b',
        typ: 'text',
        quelle: '/media/hort/texte/notes.md',
        untertitel: 'B',
      },
    ]

    const io = makeIo(custom)
    seedFile(io.getPaths().appRoot, '/media/hort/texte/notes.txt', TEXT_OLD)
    seedFile(io.getPaths().appRoot, '/media/hort/texte/notes.md', TEXT_MD)

    const result = await replaceStationMediumFile(
      {
        slug: 'hort',
        mediumId: 'text-a',
        source: { buffer: Buffer.from('# Kollision\n', 'utf8') },
        originalName: 'notes.md',
      },
      io,
    )

    expect(result.quelle).toBe('/media/hort/texte/notes-2.md')
    expect(existsSync(join(io.getPaths().appRoot, 'public', 'media/hort/texte/notes-2.md'))).toBe(
      true,
    )
    expect(existsSync(join(io.getPaths().appRoot, 'public', 'media/hort/texte/notes.md'))).toBe(
      true,
    )
  })

  it('geteilte quelle: neuer Pfad, fremdes Medium behält Original-Bytes', async () => {
    const shared = '/media/hort/fotos/shared.jpg'
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      { id: 'foto-a', typ: 'foto', quelle: shared, untertitel: 'A' },
      { id: 'foto-b', typ: 'foto', quelle: shared, untertitel: 'B' },
    ]

    const io = makeIo(custom)
    const sharedPath = seedFile(io.getPaths().appRoot, shared, JPEG)
    const newJpeg = pad(Buffer.concat([JPEG, Buffer.from('NEW')]))

    const result = await replaceStationMediumFile(
      {
        slug: 'hort',
        mediumId: 'foto-a',
        source: { buffer: newJpeg },
        originalName: 'shared.jpg',
      },
      io,
    )

    expect(result.quelle).not.toBe(shared)
    expect(result.quelle).toMatch(/^\/media\/hort\/fotos\/shared(-\d+)?\.jpg$/)
    expect(readFileSync(sharedPath)).toEqual(JPEG)
    expect(readFileSync(join(io.getPaths().appRoot, 'public', result.quelle.slice(1)))).toEqual(
      newJpeg,
    )

    const data = readStationsFile(io)
    const b = data.stations.find((s) => s.slug === 'hort')!.medien.find((m) => m.id === 'foto-b')!
    expect(b.quelle).toBe(shared)
  })

  it('setzt videoSource=upload bei Video ohne videoSource', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'video-open',
        typ: 'video',
        quelle: '/media/hort/video/open.mp4',
        untertitel: 'Offen',
      },
    ]

    const io = makeIo(custom)
    seedFile(io.getPaths().appRoot, '/media/hort/video/open.mp4', MP4)

    const result = await replaceStationMediumFile(
      {
        slug: 'hort',
        mediumId: 'video-open',
        source: { buffer: MP4 },
        originalName: 'open.mp4',
      },
      io,
    )

    expect(result.medium.videoSource).toBe('upload')
    expect(result.quelle).toBe('/media/hort/video/open.mp4')
  })

  it('YouTube-Video → FIELD_NOT_ALLOWED', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'yt',
        typ: 'video',
        videoSource: 'youtube',
        quelle: 'https://www.youtube.com/watch?v=abc',
        untertitel: 'YT',
      },
    ]

    const io = makeIo(custom)
    await expect(
      replaceStationMediumFile(
        {
          slug: 'hort',
          mediumId: 'yt',
          source: { buffer: MP4 },
          originalName: 'clip.mp4',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'FIELD_NOT_ALLOWED' })
  })

  it('link-Medium → FIELD_NOT_ALLOWED', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'hort-link',
        typ: 'link',
        quelle: 'https://example.com/info',
        untertitel: 'Link',
      },
    ]

    const io = makeIo(custom)
    await expect(
      replaceStationMediumFile(
        {
          slug: 'hort',
          mediumId: 'hort-link',
          source: { buffer: JPEG },
          originalName: 'x.jpg',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'FIELD_NOT_ALLOWED' })
  })

  it('unbekannte mediumId → NOT_FOUND', async () => {
    const io = makeIo()
    await expect(
      replaceStationMediumFile(
        {
          slug: 'klassenzimmer',
          mediumId: 'fehlt',
          source: { buffer: MP3_NEW },
          originalName: 'x.mp3',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('Kompensation In-Place: JSON-Fehler lässt alte Datei unverändert', async () => {
    const io = makeIo()
    const quelle = '/media/klassenzimmer/audio/grundschule_demo.mp3'
    const filePath = seedFile(io.getPaths().appRoot, quelle, MP3_OLD)

    vi.spyOn(io, 'writeStations').mockRejectedValueOnce(
      new MpzContentIoError('VALIDATION', 'Write fehlgeschlagen'),
    )

    await expect(
      replaceStationMediumFile(
        {
          slug: 'klassenzimmer',
          mediumId: 'demo-audio',
          source: { buffer: MP3_NEW },
          originalName: 'x.mp3',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })

    expect(readFileSync(filePath)).toEqual(MP3_OLD)
    const tmpLeft = existsSync(`${filePath}.${process.pid}.tmp`)
    expect(tmpLeft).toBe(false)
  })

  it('Kompensation neuer Pfad: JSON-Fehler entfernt neue Datei', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const klassenzimmer = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const textMedium = klassenzimmer.medien.find((m) => m.id === 'demo-text')!
    textMedium.quelle = '/media/klassenzimmer/texte/notes.txt'

    const io = makeIo(custom)
    const oldQuelle = '/media/klassenzimmer/texte/notes.txt'
    seedFile(io.getPaths().appRoot, oldQuelle, TEXT_OLD)

    vi.spyOn(io, 'writeStations').mockRejectedValueOnce(
      new MpzContentIoError('VALIDATION', 'Write fehlgeschlagen'),
    )

    await expect(
      replaceStationMediumFile(
        {
          slug: 'klassenzimmer',
          mediumId: 'demo-text',
          source: { buffer: TEXT_MD },
          originalName: 'notes.md',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })

    expect(existsSync(join(io.getPaths().appRoot, 'public', oldQuelle.slice(1)))).toBe(true)
    expect(existsSync(join(io.getPaths().appRoot, 'public', 'media/klassenzimmer/texte/notes.md'))).toBe(
      false,
    )

    const data = readStationsFile(io)
    const medium = data.stations
      .find((s) => s.slug === 'klassenzimmer')!
      .medien.find((m) => m.id === 'demo-text')!
    expect(medium.quelle).toBe(oldQuelle)
  })
})
