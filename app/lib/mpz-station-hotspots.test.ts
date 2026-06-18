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
  addStationHotspot,
  MpzStationHotspotsError,
  patchStationHotspot,
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

function stationWithFlatMedias() {
  const custom = structuredClone(fixture) as StationsFile
  const kunst = custom.stations.find((s) => s.slug === 'kunst')!
  kunst.viewer = 'flat'
  kunst.medien = [
    { id: 'm1', typ: 'text', quelle: '/media/kunst/texte/a.md' },
    { id: 'm2', typ: 'text', quelle: '/media/kunst/texte/b.md' },
  ]
  kunst.hotspots = undefined
  return custom
}

function writeIconFile(io: ReturnType<typeof makeTempIo>, slug: string, name: string) {
  const iconsDir = join(io.getPaths().appRoot, 'public', 'media', slug, 'icons')
  mkdirSync(iconsDir, { recursive: true })
  const iconPath = join(iconsDir, name)
  writeFileSync(iconPath, '<svg xmlns="http://www.w3.org/2000/svg"/>', 'utf8')
  return `/media/${slug}/icons/${name}`
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
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    await removeStationHotspot('daz', 'hs-frieda', io)

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('station.dialog ist verwaist'),
    )

    const onDisk = JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
    expect(onDisk.stations.find((s) => s.slug === 'daz')?.dialog).toBeDefined()
  })

  describe('addStationHotspot', () => {
    it('Flat: legt Hotspot mit Koordinaten an', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)

      const result = await addStationHotspot(
        'kunst',
        {
          id: 'hs-neu',
          label: 'Test',
          mediumId: 'm1',
          x: 0.51234,
          y: 0.31876,
          iconSize: 0.2,
        },
        io,
      )

      expect(result.station.hotspots).toHaveLength(1)
      expect(result.station.hotspots?.[0]).toEqual({
        id: 'hs-neu',
        label: 'Test',
        x: 0.5123,
        y: 0.3188,
        mediumId: 'm1',
        iconSize: 0.2,
      })
    })

    it('Sphere: legt Hotspot mit yaw/pitch an', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)

      const result = await addStationHotspot(
        'klassenzimmer',
        {
          id: 'hs-neu-sphere',
          mediumId: 'demo-text',
          yaw: 45.5,
          pitch: -10.3,
          iconSize: 0.2,
        },
        io,
      )

      expect(result.station.hotspots360?.some((h) => h.id === 'hs-neu-sphere')).toBe(true)
      const hs = result.station.hotspots360?.find((h) => h.id === 'hs-neu-sphere')
      expect(hs?.yaw).toBe(45.5)
      expect(hs?.pitch).toBe(-10.3)
      expect(hs?.mediumId).toBe('demo-text')
    })

    it('mit Icon-Pfad wenn Datei existiert', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      const iconPath = writeIconFile(io, 'kunst', 'test.svg')

      const result = await addStationHotspot(
        'kunst',
        {
          id: 'hs-icon',
          mediumId: 'm1',
          x: 0.5,
          y: 0.5,
          icon: iconPath,
        },
        io,
      )

      expect(result.station.hotspots?.[0]?.icon).toBe(iconPath)
    })

    it('NO_MEDIAS wenn keine Medien', async () => {
      const custom = structuredClone(fixture) as StationsFile
      const kunst = custom.stations.find((s) => s.slug === 'kunst')!
      kunst.medien = []
      const io = makeTempIo(custom)
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot('kunst', { id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'NO_MEDIAS' })
    })

    it('INVALID_ID bei ungültiger ID', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot('kunst', { id: 'HS-Bad', mediumId: 'm1', x: 0.5, y: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_ID' })
    })

    it('DUPLICATE_ID bei bestehender ID', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'klassenzimmer',
          { id: 'hs-text', mediumId: 'demo-text', yaw: 0, pitch: 0 },
          io,
        ),
      ).rejects.toMatchObject({ code: 'DUPLICATE_ID' })
    })

    it('MEDIUM_NOT_FOUND bei unbekanntem Medium', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot('kunst', { id: 'hs-x', mediumId: 'fehlt', x: 0.5, y: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'MEDIUM_NOT_FOUND' })
    })

    it('INVALID_COORDS bei x außerhalb [0,1]', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot('kunst', { id: 'hs-x', mediumId: 'm1', x: 1.5, y: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_COORDS bei yaw außerhalb Bereich', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'klassenzimmer',
          { id: 'hs-x', mediumId: 'demo-text', yaw: 200, pitch: 0 },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_ICON bei fehlender Datei', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'kunst',
          {
            id: 'hs-x',
            mediumId: 'm1',
            x: 0.5,
            y: 0.5,
            icon: '/media/kunst/icons/fehlt.svg',
          },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_ICON' })
    })

    it('INVALID_ICON_SIZE außerhalb Bereich', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'kunst',
          { id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5, iconSize: 0.3 },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_ICON_SIZE' })
    })

    it('INVALID_COORDS bei yaw auf Flat-Station', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'kunst',
          { id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5, yaw: 0 },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_COORDS bei x/y auf Sphere-Station', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot(
          'klassenzimmer',
          { id: 'hs-x', mediumId: 'demo-text', yaw: 0, pitch: 0, x: 0.5 },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_ICON wenn io.fileExists false', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      const iconPath = writeIconFile(io, 'kunst', 'ghost.svg')
      const fakeIo = { ...io, fileExists: () => false }
      await expect(
        addStationHotspot(
          'kunst',
          { id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5, icon: iconPath },
          fakeIo,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_ICON' })
    })

    it('NOT_FOUND bei unbekanntem Slug', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        addStationHotspot('fehlt', { id: 'hs-x', mediumId: 'm1', x: 0.5, y: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })
  })

  describe('patchStationHotspot', () => {
    async function addFlatHotspot(io: ReturnType<typeof makeTempIo>, overrides = {}) {
      return addStationHotspot(
        'kunst',
        {
          id: 'hs-patch',
          label: 'Alt',
          mediumId: 'm1',
          x: 0.4,
          y: 0.6,
          iconSize: 0.2,
          ...overrides,
        },
        io,
      )
    }

    it('Flat: ändert label', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)

      const result = await patchStationHotspot('kunst', 'hs-patch', { label: 'Neu' }, io)
      expect(result.station.hotspots?.[0]?.label).toBe('Neu')
    })

    it('Flat: label leeren entfernt Key', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)

      const result = await patchStationHotspot('kunst', 'hs-patch', { label: '' }, io)
      expect(result.station.hotspots?.[0]).not.toHaveProperty('label')
    })

    it('Flat: mediumId wechseln', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)

      const result = await patchStationHotspot('kunst', 'hs-patch', { mediumId: 'm2' }, io)
      expect(result.station.hotspots?.[0]?.mediumId).toBe('m2')
    })

    it('Flat: partielles x behält y', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)

      const result = await patchStationHotspot('kunst', 'hs-patch', { x: 0.75 }, io)
      expect(result.station.hotspots?.[0]?.x).toBe(0.75)
      expect(result.station.hotspots?.[0]?.y).toBe(0.6)
    })

    it('Flat: icon setzen und entfernen (null und leer)', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      const iconPath = writeIconFile(io, 'kunst', 'patch.svg')

      const withIcon = await patchStationHotspot('kunst', 'hs-patch', { icon: iconPath }, io)
      expect(withIcon.station.hotspots?.[0]?.icon).toBe(iconPath)

      const withoutIconNull = await patchStationHotspot('kunst', 'hs-patch', { icon: null }, io)
      expect(withoutIconNull.station.hotspots?.[0]).not.toHaveProperty('icon')

      await patchStationHotspot('kunst', 'hs-patch', { icon: iconPath }, io)
      const withoutIconEmpty = await patchStationHotspot('kunst', 'hs-patch', { icon: '' }, io)
      expect(withoutIconEmpty.station.hotspots?.[0]).not.toHaveProperty('icon')
    })

    it('Flat: iconSize setzen und mit null entfernen', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io, { iconSize: undefined })

      const withSize = await patchStationHotspot('kunst', 'hs-patch', { iconSize: 0.15 }, io)
      expect(withSize.station.hotspots?.[0]?.iconSize).toBe(0.15)

      const withoutSize = await patchStationHotspot('kunst', 'hs-patch', { iconSize: null }, io)
      expect(withoutSize.station.hotspots?.[0]).not.toHaveProperty('iconSize')
    })

    it('Flat: fehlender iconSize-Key lässt bestehenden Wert', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)

      const result = await patchStationHotspot('kunst', 'hs-patch', { label: 'Nur Label' }, io)
      expect(result.station.hotspots?.[0]?.iconSize).toBe(0.2)
    })

    it('Sphere: yaw/pitch patchen und partielles yaw behält pitch', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      // hs-text hat icon: '/media/klassenzimmer/icons/buch.png'; buildSphereHotspot
      // re-validiert beim Patch auch nicht geänderte Icon-Felder (Plan-Annahme ⁴).
      writeIconFile(io, 'klassenzimmer', 'buch.png')

      const result = await patchStationHotspot(
        'klassenzimmer',
        'hs-text',
        { yaw: 10, pitch: -5 },
        io,
      )
      const hs = result.station.hotspots360?.find((h) => h.id === 'hs-text')
      expect(hs?.yaw).toBe(10)
      expect(hs?.pitch).toBe(-5)

      const partial = await patchStationHotspot('klassenzimmer', 'hs-text', { yaw: 20 }, io)
      const hs2 = partial.station.hotspots360?.find((h) => h.id === 'hs-text')
      expect(hs2?.yaw).toBe(20)
      expect(hs2?.pitch).toBe(-5)
    })

    it('MEDIUM_NOT_FOUND', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      await expect(
        patchStationHotspot('kunst', 'hs-patch', { mediumId: 'fehlt' }, io),
      ).rejects.toMatchObject({ code: 'MEDIUM_NOT_FOUND' })
    })

    it('INVALID_COORDS bei x außerhalb Bereich', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      await expect(
        patchStationHotspot('kunst', 'hs-patch', { x: 1.5 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_COORDS bei yaw auf Flat-Station', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      await expect(
        patchStationHotspot('kunst', 'hs-patch', { yaw: 0 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_COORDS bei x auf Sphere-Station', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        patchStationHotspot('klassenzimmer', 'hs-text', { x: 0.5 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_COORDS' })
    })

    it('INVALID_ICON bei fehlender Datei', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      await expect(
        patchStationHotspot(
          'kunst',
          'hs-patch',
          { icon: '/media/kunst/icons/fehlt.svg' },
          io,
        ),
      ).rejects.toMatchObject({ code: 'INVALID_ICON' })
    })

    it('INVALID_ICON_SIZE außerhalb Bereich', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await addFlatHotspot(io)
      await expect(
        patchStationHotspot('kunst', 'hs-patch', { iconSize: 0.3 }, io),
      ).rejects.toMatchObject({ code: 'INVALID_ICON_SIZE' })
    })

    it('NOT_FOUND bei unbekanntem Hotspot', async () => {
      const io = makeTempIo(stationWithFlatMedias())
      temps.push(io.getPaths().appRoot)
      await expect(
        patchStationHotspot('kunst', 'fehlt', { label: 'X' }, io),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('NOT_EDITABLE bei Dialog-Hotspot', async () => {
      const io = makeTempIo()
      temps.push(io.getPaths().appRoot)
      await expect(
        patchStationHotspot('daz', 'hs-frieda', { label: 'X' }, io),
      ).rejects.toMatchObject({ code: 'NOT_EDITABLE' })
    })
  })
})

describe('MpzStationHotspotsError', () => {
  it('hat code NOT_FOUND', () => {
    const err = new MpzStationHotspotsError('NOT_FOUND', 'test')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.name).toBe('MpzStationHotspotsError')
  })
})
