import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
  MpzStationHotspotsError,
  removeStationHotspot,
} from '@/lib/mpz-station-hotspots'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile

function makeTempIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-hotspots-'))
  const stationsPath = join(appRoot, 'data', 'stations.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(initial), 'utf8')
  return createMpzContentIo({ appRoot, stationsPath, backupPath: `${stationsPath}.bak` })
}

describe('mpz-station-hotspots', () => {
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

  it('unbekannte hotspotId → NOT_FOUND', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(removeStationHotspot('klassenzimmer', 'fehlt', io)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('Sphere: entfernt einen Hotspot, andere bleiben', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    const result = await removeStationHotspot('klassenzimmer', 'hs-text', io)
    expect(result.station.hotspots360).toHaveLength(3)
    expect(result.station.hotspots360?.some((h) => h.id === 'hs-text')).toBe(false)
  })

  it('Sphere: letzter Hotspot → hotspots360 undefined', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const lesewelt = custom.stations.find((s) => s.slug === 'lesewelt')!
    lesewelt.hotspots360 = [
      {
        id: 'only-one',
        label: 'Test',
        yaw: 0,
        pitch: 0,
        mediumId: 'lesewelt-beruehmte-personen',
      },
    ]

    const io = makeTempIo(custom)
    temps.push(io.getPaths().appRoot)
    const result = await removeStationHotspot('lesewelt', 'only-one', io)
    expect(result.station.hotspots360).toBeUndefined()

    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    const station = onDisk.stations.find((s) => s.slug === 'lesewelt')!
    expect('hotspots360' in station).toBe(false)
  })

  it('Flat: entfernt Hotspot und setzt leeres Array auf undefined', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const kunst = custom.stations.find((s) => s.slug === 'kunst')!
    kunst.viewer = 'flat'
    kunst.hotspots = [
      { id: 'hs-a', label: 'A', x: 0.1, y: 0.2, mediumId: 'm1' },
      { id: 'hs-b', label: 'B', x: 0.3, y: 0.4, mediumId: 'm2' },
    ]
    kunst.medien = [
      { id: 'm1', typ: 'text', quelle: '/media/kunst/texte/a.md' },
      { id: 'm2', typ: 'text', quelle: '/media/kunst/texte/b.md' },
    ]

    const io = makeTempIo(custom)
    temps.push(io.getPaths().appRoot)

    await removeStationHotspot('kunst', 'hs-a', io)
    const mid = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    expect(mid.stations.find((s) => s.slug === 'kunst')?.hotspots).toHaveLength(1)

    await removeStationHotspot('kunst', 'hs-b', io)
    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    const station = onDisk.stations.find((s) => s.slug === 'kunst')!
    expect('hotspots' in station).toBe(false)
  })

  it('andere Stationen bleiben unverändert', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    const before = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    const dazBefore = structuredClone(before.stations.find((s) => s.slug === 'daz'))

    await removeStationHotspot('klassenzimmer', 'hs-text', io)

    const after = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    expect(after.stations.find((s) => s.slug === 'daz')).toEqual(dazBefore)
  })

  it('Round-Trip: alle Sphere-Hotspots entfernt → kein hotspots360-Key', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const kz = custom.stations.find((s) => s.slug === 'klassenzimmer')!
    const ids = kz.hotspots360!.map((h) => h.id)

    const io = makeTempIo(custom)
    temps.push(io.getPaths().appRoot)

    for (const id of ids) {
      await removeStationHotspot('klassenzimmer', id, io)
    }

    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    const station = onDisk.stations.find((s) => s.slug === 'klassenzimmer')!
    expect('hotspots360' in station).toBe(false)
    expect('hotspots' in station).toBe(false)
    expect(station.hotspots360).toBeUndefined()
  })

  it('warnt bei verwaistem dialog nach Entfernen des letzten Dialog-Hotspots', async () => {
    const custom = structuredClone(fixture) as StationsFile
    const mini = custom.stations.find((s) => s.slug === 'daz')!
    mini.hotspots360 = [mini.hotspots360![0]]

    const io = makeTempIo(custom)
    temps.push(io.getPaths().appRoot)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await removeStationHotspot('daz', 'hs-frieda', io)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('station.dialog ist verwaist'),
    )

    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    expect(onDisk.stations.find((s) => s.slug === 'daz')?.dialog).toBeDefined()
  })
})

describe('MpzStationHotspotsError', () => {
  it('hat code NOT_FOUND', () => {
    const err = new MpzStationHotspotsError('NOT_FOUND', 'test')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.name).toBe('MpzStationHotspotsError')
  })
})
