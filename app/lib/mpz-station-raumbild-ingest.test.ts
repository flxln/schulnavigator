import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import { createMpzContentIo, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import {
  FLAT_MAX_BYTES,
  ingestStationRaumbild,
  PANO360_MAX_BYTES,
  validateRaumbildUpload,
} from '@/lib/mpz-station-raumbild-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile

function makeJpegSofSegment(width: number, height: number): Buffer {
  const sof = Buffer.alloc(17)
  sof[0] = 0xff
  sof[1] = 0xc0
  sof.writeUInt16BE(15, 2)
  sof[4] = 0x08
  sof.writeUInt16BE(height, 5)
  sof.writeUInt16BE(width, 7)
  sof[9] = 0x01
  sof[10] = 0x11
  sof[11] = 0x00
  sof[12] = 0x03
  sof[13] = 0x11
  sof[14] = 0x01
  sof[15] = 0x11
  sof[16] = 0x01
  return sof
}

function makeMinimalJpeg(width: number, height: number, exifPadBytes = 0, padTo = 1024): Buffer {
  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])]
  if (exifPadBytes > 0) {
    const app1 = Buffer.alloc(4 + exifPadBytes)
    app1[0] = 0xff
    app1[1] = 0xe1
    app1.writeUInt16BE(exifPadBytes + 2, 2)
    chunks.push(app1)
  }
  chunks.push(makeJpegSofSegment(width, height))
  const buf = Buffer.concat(chunks)
  const tail = Buffer.alloc(Math.max(0, padTo - buf.length), 0)
  return Buffer.concat([buf, tail])
}

function makeMinimalWebpVp8x(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(22, 4)
  buf.write('WEBP', 8)
  buf.write('VP8X', 12)
  buf.writeUInt32LE(10, 16)
  buf[20] = 0x10
  const w = width - 1
  const h = height - 1
  buf[24] = w & 0xff
  buf[25] = (w >> 8) & 0xff
  buf[26] = (w >> 16) & 0xff
  buf[27] = h & 0xff
  buf[28] = (h >> 8) & 0xff
  buf[29] = (h >> 16) & 0xff
  return Buffer.concat([buf, Buffer.alloc(1024)])
}

const temps: string[] = []

function setupTempApp(stations: StationsFile = structuredClone(fixture)): ReturnType<typeof createMpzContentIo> {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-raumbild-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public', 'stations', '360'), { recursive: true })
  writeFileSync(join(appRoot, 'data', 'stations.json'), JSON.stringify(stations, null, 2))
  return createMpzContentIo({ appRoot })
}

describe('mpz-station-raumbild-ingest · validateRaumbildUpload', () => {
  it('akzeptiert Flat-JPEG mit 2,5:1 und Exif-Pad', async () => {
    const buf = makeMinimalJpeg(250, 100, 8192)
    await expect(
      validateRaumbildUpload({ buffer: buf, variant: 'flat', originalName: 'pano.jpg' }),
    ).resolves.toEqual({ ext: '.jpg' })
  })

  it('lehnt Flat mit falschem Ratio ab', async () => {
    const buf = makeMinimalJpeg(200, 100)
    await expect(
      validateRaumbildUpload({ buffer: buf, variant: 'flat', originalName: 'pano.jpg' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('lehnt zu große Flat-Datei ab', async () => {
    const buf = makeMinimalJpeg(250, 100, 0, FLAT_MAX_BYTES + 1)
    await expect(
      validateRaumbildUpload({ buffer: buf, variant: 'flat', originalName: 'pano.jpg' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('akzeptiert 360° WebP 2:1', async () => {
    const buf = makeMinimalWebpVp8x(2000, 1000)
    await expect(
      validateRaumbildUpload({ buffer: buf, variant: 'pano360', originalName: 'pano.webp' }),
    ).resolves.toEqual({ ext: '.webp' })
  })
})

describe('mpz-station-raumbild-ingest · ingestStationRaumbild', () => {
  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  afterEach(() => {
    resetMpzWriteLockForTests()
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
    vi.restoreAllMocks()
  })

  it('schreibt Flat-JPEG und setzt bild', async () => {
    const io = setupTempApp()
    const buf = makeMinimalJpeg(250, 100)
    const result = await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'flat',
        source: { buffer: buf },
        originalName: 'hort.jpg',
        collision: 'reject',
      },
      io,
    )
    expect(result.path).toBe('/stations/hort.jpg')
    expect(result.station.bild).toBe('/stations/hort.jpg')
    const fsPath = join(io.getPaths().appRoot, 'public', 'stations', 'hort.jpg')
    expect(existsSync(fsPath)).toBe(true)
    expect(readFileSync(fsPath).equals(buf)).toBe(true)
  })

  it('COLLISION bei Flat reject wenn Datei existiert', async () => {
    const io = setupTempApp()
    const buf = makeMinimalJpeg(250, 100)
    await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'flat',
        source: { buffer: buf },
        originalName: 'hort.jpg',
        collision: 'replace',
      },
      io,
    )
    await expect(
      ingestStationRaumbild(
        {
          slug: 'hort',
          variant: 'flat',
          source: { buffer: buf },
          originalName: 'hort.jpg',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('COLLISION bei pano360 Formatwechsel (jpg vorhanden, webp reject)', async () => {
    const io = setupTempApp()
    const jpg = makeMinimalJpeg(2000, 1000)
    await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'pano360',
        source: { buffer: jpg },
        originalName: 'hort.jpg',
        collision: 'replace',
      },
      io,
    )
    const webp = makeMinimalWebpVp8x(2000, 1000)
    await expect(
      ingestStationRaumbild(
        {
          slug: 'hort',
          variant: 'pano360',
          source: { buffer: webp },
          originalName: 'hort.webp',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('Formatwechsel pano360 jpg→webp mit replace löscht alte Datei', async () => {
    const io = setupTempApp()
    const jpg = makeMinimalJpeg(2000, 1000)
    await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'pano360',
        source: { buffer: jpg },
        originalName: 'hort.jpg',
        collision: 'replace',
      },
      io,
    )
    const oldPath = join(io.getPaths().appRoot, 'public', 'stations', '360', 'hort.jpg')
    expect(existsSync(oldPath)).toBe(true)

    const webp = makeMinimalWebpVp8x(2000, 1000)
    const result = await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'pano360',
        source: { buffer: webp },
        originalName: 'hort.webp',
        collision: 'replace',
      },
      io,
    )
    expect(result.path).toBe('/stations/360/hort.webp')
    expect(existsSync(oldPath)).toBe(false)
    expect(
      existsSync(join(io.getPaths().appRoot, 'public', 'stations', '360', 'hort.webp')),
    ).toBe(true)
  })

  it('Rollback bei writeStations-Fehler: neue Datei weg, Alt-Datei erhalten', async () => {
    const io = setupTempApp()
    const jpg = makeMinimalJpeg(2000, 1000)
    await ingestStationRaumbild(
      {
        slug: 'hort',
        variant: 'pano360',
        source: { buffer: jpg },
        originalName: 'hort.jpg',
        collision: 'replace',
      },
      io,
    )
    const oldPath = join(io.getPaths().appRoot, 'public', 'stations', '360', 'hort.jpg')

    vi.spyOn(io, 'writeStations').mockRejectedValueOnce(
      new MpzUploadError('VALIDATION', 'postValidate forced fail'),
    )

    const webp = makeMinimalWebpVp8x(2000, 1000)
    await expect(
      ingestStationRaumbild(
        {
          slug: 'hort',
          variant: 'pano360',
          source: { buffer: webp },
          originalName: 'hort.webp',
          collision: 'replace',
        },
        io,
      ),
    ).rejects.toBeTruthy()

    expect(existsSync(oldPath)).toBe(true)
    expect(
      existsSync(join(io.getPaths().appRoot, 'public', 'stations', '360', 'hort.webp')),
    ).toBe(false)
    const data = JSON.parse(
      readFileSync(join(io.getPaths().appRoot, 'data', 'stations.json'), 'utf8'),
    ) as StationsFile
    const hort = data.stations.find((s) => s.slug === 'hort')
    expect(hort?.panorama360).toBe('/stations/360/hort.jpg')
  })
})
