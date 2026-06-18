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
})
