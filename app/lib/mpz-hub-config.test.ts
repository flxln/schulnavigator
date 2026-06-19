import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import rawStations from '@/data/stations.json'
import {
  createMpzContentIo,
  resetMpzWriteLockForTests,
  serializeHubSlugMapFile,
  serializeStationAccentsFile,
  serializeStationIconsFile,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import { parsePutBody, replaceHubConfig } from '@/lib/mpz-hub-config'
import type { HubConfigBundle } from '@/lib/mpz-hub-config-validation'
import { FALLBACK_HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import { FALLBACK_STATION_ACCENTS } from '@/lib/gs39-brand-colors'
import type { StationsFile } from '@/lib/types'

const stationsFixture = rawStations as StationsFile

const defaultIcons: HubConfigBundle['icons'] = {
  icons: {
    klassenzimmer: { type: 'lucide', name: 'GraduationCap' },
    musik: { type: 'lucide', name: 'Music' },
    daz: { type: 'lucide', name: 'Languages' },
    kunst: { type: 'lucide', name: 'Palette' },
    'pc-raum': { type: 'lucide', name: 'Monitor' },
    lesewelt: { type: 'lucide', name: 'BookOpen' },
    werken: { type: 'lucide', name: 'Hammer' },
    speiseraum: { type: 'lucide', name: 'UtensilsCrossed' },
    hort: { type: 'lucide', name: 'Home' },
    turnhalle: { type: 'lucide', name: 'PersonStanding' },
    schulsozialarbeit: { type: 'lucide', name: 'HeartHandshake' },
    schulhof: { type: 'lucide', name: 'Trees' },
  },
}

const defaultBundle: HubConfigBundle = {
  slugMap: { mappings: { ...FALLBACK_HUB_SLUG_MAP } },
  accents: { accents: { ...FALLBACK_STATION_ACCENTS } },
  icons: defaultIcons,
}

const temps: string[] = []

function makeTempIo(bundle: HubConfigBundle = defaultBundle, stations: StationsFile = stationsFixture) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-hub-config-'))
  temps.push(appRoot)
  const dataDir = join(appRoot, 'data')
  mkdirSync(dataDir, { recursive: true })

  const stationsPath = join(dataDir, 'stations.json')
  const hubSlugMapPath = join(dataDir, 'hub-slug-map.json')
  const stationAccentsPath = join(dataDir, 'station-accents.json')
  const stationIconsPath = join(dataDir, 'station-icons.json')

  writeFileSync(stationsPath, serializeStationsFile(stations), 'utf8')
  writeFileSync(hubSlugMapPath, serializeHubSlugMapFile(bundle.slugMap), 'utf8')
  writeFileSync(stationAccentsPath, serializeStationAccentsFile(bundle.accents), 'utf8')
  writeFileSync(stationIconsPath, serializeStationIconsFile(bundle.icons), 'utf8')

  return createMpzContentIo({
    appRoot,
    stationsPath,
    backupPath: `${stationsPath}.bak`,
    hubSlugMapPath,
    hubSlugMapBackupPath: `${hubSlugMapPath}.bak`,
    stationAccentsPath,
    stationAccentsBackupPath: `${stationAccentsPath}.bak`,
    stationIconsPath,
    stationIconsBackupPath: `${stationIconsPath}.bak`,
  })
}

function readHubSlugMap(io: ReturnType<typeof makeTempIo>) {
  return JSON.parse(readFileSync(io.getPaths().hubSlugMapPath, 'utf8')) as HubConfigBundle['slugMap']
}

afterEach(() => {
  resetMpzWriteLockForTests()
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('parsePutBody', () => {
  it('wraps flache Maps in Bundle-Struktur', () => {
    const parsed = parsePutBody({
      slugMap: defaultBundle.slugMap.mappings,
      accents: defaultBundle.accents.accents,
      icons: defaultBundle.icons.icons,
    })
    expect(parsed?.slugMap.mappings.klassenzimmer?.slotId).toBe('portal')
  })
})

describe('replaceHubConfig', () => {
  it('schreibt alle drei Config-Dateien', async () => {
    const io = makeTempIo()
    const swapped = structuredClone(defaultBundle)
    swapped.slugMap.mappings.musik = { slotId: 'fenster-ul-2', nr: 2 }
    swapped.slugMap.mappings.schulsozialarbeit = { slotId: 'fenster-ul-1', nr: 11 }

    await replaceHubConfig(swapped, io)

    const onDisk = readHubSlugMap(io)
    expect(onDisk.mappings.musik?.slotId).toBe('fenster-ul-2')
    expect(onDisk.mappings.schulsozialarbeit?.slotId).toBe('fenster-ul-1')
  })

  it('rollback bei doppeltem slotId', async () => {
    const io = makeTempIo()
    const broken = structuredClone(defaultBundle)
    broken.slugMap.mappings.musik = { slotId: 'portal', nr: 2 }

    await expect(replaceHubConfig(broken, io)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(readHubSlugMap(io).mappings.klassenzimmer?.slotId).toBe('portal')
  })

  it('rollback bei ungültigem Akzent', async () => {
    const io = makeTempIo()
    const broken = structuredClone(defaultBundle)
    broken.accents.accents.klassenzimmer = '#xyz123'

    await expect(replaceHubConfig(broken, io)).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(readHubSlugMap(io).mappings.klassenzimmer?.slotId).toBe('portal')
  })
})
