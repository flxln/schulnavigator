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
  resetMpzWriteLockForTests,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import { uploadStationMediumAsset } from '@/lib/mpz-medium-asset-upload'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'
import { studioDemoStationsFile } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

const fixture = studioDemoStationsFile(rawStations as StationsFile)

function pad(b: Buffer, n = 64): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, n - b.length))])
}

const JPEG = pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]))
const JPEG_NEW = pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x01]))

const temps: string[] = []

function seedFile(appRoot: string, quelle: string, content: Buffer): string {
  const filePath = join(appRoot, 'public', quelle.slice(1))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content)
  return filePath
}

function makeIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-asset-upload-'))
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

describe('mpz-medium-asset-upload · uploadStationMediumAsset', () => {
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

  it('setzt thumbnail für Audio — Erst-Upload ohne previousPath', async () => {
    const io = makeIo()

    const result = await uploadStationMediumAsset(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-audio',
        field: 'thumbnail',
        source: { buffer: JPEG },
        originalName: 'thumb.jpg',
      },
      io,
    )

    expect(result.field).toBe('thumbnail')
    expect(result.path).toMatch(/^\/media\/klassenzimmer\/fotos\/thumb\.jpg$/)
    expect(result.previousPath).toBeNull()
    expect(result.previousFileDeleted).toBe(false)
    expect(result.medium.thumbnail).toBe(result.path)
    expect(result.medium.id).toBe('demo-audio')

    const data = readStationsFile(io)
    const medium = data.stations
      .find((s) => s.slug === 'klassenzimmer')
      ?.medien.find((m) => m.id === 'demo-audio')
    expect(medium?.thumbnail).toBe(result.path)
    expect(existsSync(join(io.getPaths().appRoot, 'public', result.path.slice(1)))).toBe(true)
  })

  it('ersetzt thumbnail und löscht alte Datei wenn unreferenziert', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const klassenzimmer = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const audio = klassenzimmer.medien.find((m) => m.id === 'demo-audio')!
    const oldPath = '/media/klassenzimmer/fotos/old-thumb.jpg'
    audio.thumbnail = oldPath

    const io = makeIo(custom)
    seedFile(io.getPaths().appRoot, oldPath, JPEG)

    const result = await uploadStationMediumAsset(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-audio',
        field: 'thumbnail',
        source: { buffer: JPEG_NEW },
        originalName: 'new-thumb.jpg',
      },
      io,
    )

    expect(result.previousPath).toBe(oldPath)
    expect(result.previousFileDeleted).toBe(true)
    expect(existsSync(join(io.getPaths().appRoot, 'public', oldPath.slice(1)))).toBe(false)
    expect(result.path).toMatch(/^\/media\/klassenzimmer\/fotos\/new-thumb\.jpg$/)
  })

  it('behält altes thumbnail wenn Pfad von anderem Medium referenziert', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const klassenzimmer = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const shared = '/media/klassenzimmer/fotos/shared.jpg'
    const audio = klassenzimmer.medien.find((m) => m.id === 'demo-audio')!
    const foto = klassenzimmer.medien.find((m) => m.id === 'demo-foto')!
    audio.thumbnail = shared
    foto.thumbnail = shared

    const io = makeIo(custom)
    seedFile(io.getPaths().appRoot, shared, JPEG)

    const result = await uploadStationMediumAsset(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-audio',
        field: 'thumbnail',
        source: { buffer: JPEG_NEW },
        originalName: 'only-audio.jpg',
      },
      io,
    )

    expect(result.previousPath).toBe(shared)
    expect(result.previousFileDeleted).toBe(false)
    expect(existsSync(join(io.getPaths().appRoot, 'public', shared.slice(1)))).toBe(true)

    const data = readStationsFile(io)
    const other = data.stations
      .find((s) => s.slug === 'klassenzimmer')
      ?.medien.find((m) => m.id === 'demo-foto')
    expect(other?.thumbnail).toBe(shared)
  })

  it('poster auf audio → FIELD_NOT_ALLOWED', async () => {
    const io = makeIo()

    await expect(
      uploadStationMediumAsset(
        {
          slug: 'klassenzimmer',
          mediumId: 'demo-audio',
          field: 'poster',
          source: { buffer: JPEG },
          originalName: 'poster.jpg',
        },
        io,
      ),
    ).rejects.toMatchObject({
      name: 'MpzStationMedienError',
      code: 'FIELD_NOT_ALLOWED',
    } satisfies Partial<MpzStationMedienError>)
  })

  it('poster auf video mit videoSource youtube erlaubt', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const klassenzimmer = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const video = klassenzimmer.medien.find((m) => m.id === 'demo-video')!
    video.videoSource = 'youtube'
    video.quelle = 'https://www.youtube.com/watch?v=demo'

    const io = makeIo(custom)

    const result = await uploadStationMediumAsset(
      {
        slug: 'klassenzimmer',
        mediumId: 'demo-video',
        field: 'poster',
        source: { buffer: JPEG },
        originalName: 'yt-poster.jpg',
      },
      io,
    )

    expect(result.field).toBe('poster')
    expect(result.path).toMatch(/^\/media\/klassenzimmer\/fotos\/yt-poster\.jpg$/)
    expect(result.medium.poster).toBe(result.path)
    expect(result.medium.videoSource).toBe('youtube')
  })

  it('thumbnail für link-Medium', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const hort = custom.stations.find((s) => s.slug === 'hort')!
    hort.medien.push({
      id: 'demo-link',
      typ: 'link',
      quelle: 'https://example.com/page',
    })

    const io = makeIo(custom)

    const result = await uploadStationMediumAsset(
      {
        slug: 'hort',
        mediumId: 'demo-link',
        field: 'thumbnail',
        source: { buffer: JPEG },
        originalName: 'link-thumb.webp',
      },
      io,
    )

    expect(result.medium.typ).toBe('link')
    expect(result.medium.thumbnail).toBe(result.path)
    expect(result.path).toMatch(/^\/media\/hort\/fotos\/link-thumb\.webp$/)
  })
})
