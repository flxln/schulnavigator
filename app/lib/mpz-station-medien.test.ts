import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import {
  createMpzContentIo,
  resetMpzWriteLockForTests,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import {
  MpzStationMedienError,
  patchStationMedium,
  removeStationMedium,
  resolvePublicMediaPath,
} from '@/lib/mpz-station-medien'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile

function makeTempIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-medien-'))
  const stationsPath = join(appRoot, 'data', 'stations.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(initial), 'utf8')
  return createMpzContentIo({ appRoot, stationsPath, backupPath: `${stationsPath}.bak` })
}

describe('mpz-station-medien', () => {
  const temps: string[] = []

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

  it('resolvePublicMediaPath lehnt Path-Traversal ab', () => {
    const appRoot = '/app'
    expect(
      resolvePublicMediaPath(appRoot, '/media/hort/../klassenzimmer/x.jpg', 'hort'),
    ).toBeNull()
  })

  it('unbekannte mediumId → NOT_FOUND', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(removeStationMedium('hort', 'fehlt', io)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('klassenzimmer demo-video → HOTSPOT_REFERENCE', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(removeStationMedium('klassenzimmer', 'demo-video', io)).rejects.toMatchObject({
      code: 'HOTSPOT_REFERENCE',
    })
  })

  it('Sharing-Fall: demo-foto entfernen behält grundschule_demo.jpg', async () => {
    const shared = '/media/hort/fotos/shared.jpg'
    const customFixture = structuredClone(fixture) as StationsFile
    const hort = customFixture.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'foto-a',
        typ: 'foto',
        quelle: shared,
        untertitel: 'A',
      },
      {
        id: 'video-b',
        typ: 'video',
        videoSource: 'upload',
        quelle: '/media/hort/video/b.mp4',
        poster: shared,
        thumbnail: shared,
        untertitel: 'B',
      },
    ]

    const io = makeTempIo(customFixture)
    const { appRoot } = io.getPaths()
    temps.push(appRoot)
    const filePath = join(appRoot, 'public', 'media', 'hort', 'fotos', 'shared.jpg')
    mkdirSync(join(appRoot, 'public', 'media', 'hort', 'fotos'), { recursive: true })
    writeFileSync(filePath, 'dummy-image', 'utf8')

    const result = await removeStationMedium('hort', 'foto-a', io)
    expect(result.fileDeleted).toBe(false)
    expect(result.fileKeptReason).toBe('still-referenced')
    expect(existsSync(filePath)).toBe(true)

    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    const hortAfter = onDisk.stations.find((s) => s.slug === 'hort')
    expect(hortAfter?.medien.some((m) => m.id === 'foto-a')).toBe(false)
    expect(hortAfter?.medien.some((m) => m.id === 'video-b')).toBe(true)
  })

  it('entfernt Datei wenn Pfad nicht mehr referenziert', async () => {
    const quelle = '/media/hort/audio/only.mp3'
    const customFixture = structuredClone(fixture) as StationsFile
    const hort = customFixture.stations.find((s) => s.slug === 'hort')!
    hort.medien = [
      {
        id: 'solo-audio',
        typ: 'audio',
        quelle,
        untertitel: 'Solo',
      },
    ]

    const io = makeTempIo(customFixture)
    const { appRoot } = io.getPaths()
    temps.push(appRoot)
    const filePath = join(appRoot, 'public', 'media', 'hort', 'audio', 'only.mp3')
    mkdirSync(join(appRoot, 'public', 'media', 'hort', 'audio'), { recursive: true })
    writeFileSync(filePath, 'dummy-audio', 'utf8')

    const result = await removeStationMedium('hort', 'solo-audio', io)
    expect(result.fileDeleted).toBe(true)
    expect(existsSync(filePath)).toBe(false)
  })

  it('wirft MpzStationMedienError mit hotspotIds', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    try {
      await removeStationMedium('klassenzimmer', 'demo-video', io)
      expect.fail('sollte werfen')
    } catch (err) {
      expect(err).toBeInstanceOf(MpzStationMedienError)
      expect((err as MpzStationMedienError).hotspotIds).toContain('hs-video')
    }
  })

  describe('patchStationMedium', () => {
    it('audio: untertitel und thumbnail setzen', async () => {
      const quelle = '/media/hort/audio/only.mp3'
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [{ id: 'solo-audio', typ: 'audio', quelle, untertitel: 'Alt' }]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'hort',
        'solo-audio',
        { untertitel: 'Neu', thumbnail: '/media/hort/icons/x.svg' },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'solo-audio')
      expect(medium?.untertitel).toBe('Neu')
      expect(medium?.thumbnail).toBe('/media/hort/icons/x.svg')
    })

    it('audio: leerer untertitel entfernt Feld', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        {
          id: 'solo-audio',
          typ: 'audio',
          quelle: '/media/hort/audio/only.mp3',
          untertitel: 'Alt',
        },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium('hort', 'solo-audio', { untertitel: '' }, io)
      const medium = result.station.medien.find((m) => m.id === 'solo-audio')
      expect(medium?.untertitel).toBeUndefined()
    })

    it('video: poster und videoSource', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        {
          id: 'vid',
          typ: 'video',
          videoSource: 'upload',
          quelle: '/media/hort/video/b.mp4',
        },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'hort',
        'vid',
        { poster: '/media/hort/fotos/poster.jpg', videoSource: 'youtube' },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'vid')
      expect(medium?.poster).toBe('/media/hort/fotos/poster.jpg')
      expect(medium?.videoSource).toBe('youtube')
    })

    it('link: quelle und openIn', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        {
          id: 'bc-link',
          typ: 'link',
          quelle: 'https://bookcreator.com/old',
          openIn: 'external',
        },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'hort',
        'bc-link',
        { quelle: 'https://bookcreator.com/new', openIn: '' },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'bc-link')
      expect(medium?.quelle).toBe('https://bookcreator.com/new')
      expect(medium?.openIn).toBeUndefined()
    })

    it('embed: nur quelle gepatcht — Merged-State mit bestehendem embedAllow', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const pc = customFixture.stations.find((s) => s.slug === 'pc-raum')!
      const delightex = pc.medien.find((m) => m.id === 'pc-delightex')!
      delightex.embedAllow = ['delightex.com']

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'pc-raum',
        'pc-delightex',
        { quelle: 'https://edu.delightex.com/NEW-URL' },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'pc-delightex')
      expect(medium?.quelle).toBe('https://edu.delightex.com/NEW-URL')
      expect(medium?.embedAllow).toEqual(['delightex.com'])
    })

    it('embed: nur embedAllow gepatcht — Merged-State mit bestehender quelle', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const pc = customFixture.stations.find((s) => s.slug === 'pc-raum')!

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'pc-raum',
        'pc-delightex',
        { embedAllow: ['delightex.com', 'bookcreator.com'] },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'pc-delightex')
      expect(medium?.embedAllow).toEqual(['delightex.com', 'bookcreator.com'])
    })

    it('embed: leeres embedAllow entfernt Feld', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const pc = customFixture.stations.find((s) => s.slug === 'pc-raum')!
      const delightex = pc.medien.find((m) => m.id === 'pc-delightex')!
      delightex.embedAllow = ['delightex.com']

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      const result = await patchStationMedium(
        'pc-raum',
        'pc-delightex',
        { embedAllow: [] },
        io,
      )
      const medium = result.station.medien.find((m) => m.id === 'pc-delightex')
      expect(medium?.embedAllow).toBeUndefined()
    })

    it('poster auf audio → FIELD_NOT_ALLOWED (auch null)', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        { id: 'a', typ: 'audio', quelle: '/media/hort/audio/x.mp3' },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      await expect(
        patchStationMedium('hort', 'a', { poster: null }, io),
      ).rejects.toMatchObject({ code: 'FIELD_NOT_ALLOWED' })
    })

    it('leerer Patch → NO_FIELDS', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        { id: 'solo-audio', typ: 'audio', quelle: '/media/hort/audio/only.mp3' },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)
      await expect(patchStationMedium('hort', 'solo-audio', {}, io)).rejects.toMatchObject({
        code: 'NO_FIELDS',
      })
    })

    it('unbekannte mediumId → NOT_FOUND', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        patchStationMedium('hort', 'fehlt', { untertitel: 'X' }, io),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('thumbnail ohne / → INVALID_THUMBNAIL', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const hort = customFixture.stations.find((s) => s.slug === 'hort')!
      hort.medien = [
        { id: 'a', typ: 'foto', quelle: '/media/hort/fotos/x.jpg' },
      ]

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      await expect(
        patchStationMedium('hort', 'a', { thumbnail: 'ohne-slash' }, io),
      ).rejects.toMatchObject({ code: 'INVALID_THUMBNAIL' })
    })

    it('embed quelle außerhalb Allowlist → INVALID_QUELLE', async () => {
      const customFixture = structuredClone(fixture) as StationsFile
      const pc = customFixture.stations.find((s) => s.slug === 'pc-raum')!

      const io = makeTempIo(customFixture)
      temps.push(io.getPaths().appRoot)

      await expect(
        patchStationMedium(
          'pc-raum',
          'pc-delightex',
          { quelle: 'https://evil.example.com/x' },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_QUELLE' })
    })
  })
})
