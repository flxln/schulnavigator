import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import { createMpzContentIo, serializeStationsFile, MpzContentIoError, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import {
  MpzStationStammdatenError,
  patchStationStammdaten,
  readStationStammdaten,
} from '@/lib/mpz-station-stammdaten'
import type { StationsFile } from '@/lib/types'
import { studioDemoStationsFile } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

const fixture = studioDemoStationsFile(raw as StationsFile)

function makeTempIo(initial: StationsFile = fixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-stammdaten-'))
  const stationsPath = join(appRoot, 'data', 'stations.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(initial), 'utf8')
  return createMpzContentIo({ appRoot, stationsPath, backupPath: `${stationsPath}.bak` })
}

describe('mpz-station-stammdaten', () => {
  const temps: string[] = []

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

  it('readStationStammdaten liefert Station', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    const station = await readStationStammdaten('hort', io)
    expect(station.slug).toBe('hort')
  })

  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  it('beschreibung einer flat-Station ändern', async () => {
    const io = makeTempIo()
    const { stationsPath, appRoot } = io.getPaths()
    temps.push(appRoot)
    const result = await patchStationStammdaten(
      'hort',
      { beschreibung: 'Neue Hort-Beschreibung für Tests.' },
      io,
    )
    expect(result.station.beschreibung).toBe('Neue Hort-Beschreibung für Tests.')
    const onDisk = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile
    const hort = onDisk.stations.find((s) => s.slug === 'hort')
    expect(hort?.beschreibung).toBe('Neue Hort-Beschreibung für Tests.')
  })

  it('leerer titel → EMPTY_FIELD', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(patchStationStammdaten('hort', { titel: '   ' }, io)).rejects.toMatchObject({
      code: 'EMPTY_FIELD',
    })
  })

  it('leere beschreibung → EMPTY_FIELD', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(patchStationStammdaten('hort', { beschreibung: '' }, io)).rejects.toMatchObject({
      code: 'EMPTY_FIELD',
    })
  })

  it('Patch ohne Feld → NO_FIELDS', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(patchStationStammdaten('hort', {}, io)).rejects.toMatchObject({
      code: 'NO_FIELDS',
    })
  })

  it('ungültiger viewer → INVALID_VIEWER', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(
      patchStationStammdaten('hort', { viewer: 'panorama' as 'flat' }, io),
    ).rejects.toMatchObject({ code: 'INVALID_VIEWER' })
  })

  it('unbekannter Hub-Slug → NOT_FOUND', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(
      patchStationStammdaten('nicht-im-hub', { titel: 'X' }, io),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('viewer flat → viewer-Key fehlt im JSON', async () => {
    const io = makeTempIo()
    const { stationsPath, appRoot } = io.getPaths()
    temps.push(appRoot)
    await patchStationStammdaten('hort', { viewer: 'flat' }, io)
    const onDisk = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile
    const hort = onDisk.stations.find((s) => s.slug === 'hort')
    expect(hort?.viewer).toBeUndefined()
  })

  it('Viewer-Wechsel zu equirectangular ohne panorama360 → VALIDATION', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(
      patchStationStammdaten('hort', { viewer: 'equirectangular' }, io),
    ).rejects.toBeInstanceOf(MpzContentIoError)
    await expect(
      patchStationStammdaten('hort', { viewer: 'equirectangular' }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('Viewer-Wechsel equirectangular → flat bei hotspots360 → VALIDATION', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    await expect(
      patchStationStammdaten('klassenzimmer', { viewer: 'flat' }, io),
    ).rejects.toBeInstanceOf(MpzContentIoError)
    await expect(
      patchStationStammdaten('klassenzimmer', { viewer: 'flat' }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('wirft MpzStationStammdatenError mit code', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    try {
      await patchStationStammdaten('hort', { titel: '' }, io)
      expect.fail('sollte werfen')
    } catch (err) {
      expect(err).toBeInstanceOf(MpzStationStammdatenError)
      expect((err as MpzStationStammdatenError).code).toBe('EMPTY_FIELD')
    }
  })
})
