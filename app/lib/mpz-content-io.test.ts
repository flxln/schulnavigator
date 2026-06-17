import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import raw from '@/data/stations.json'
import {
  canonicalizeStationsFile,
  createMpzContentIo,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'
import { validateStationAssets } from '@/scripts/validate-station-assets'

const fixture = raw as StationsFile

function makeTempIo() {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-io-'))
  const stationsPath = join(appRoot, 'data', 'stations.json')
  const backupPath = `${stationsPath}.bak`
  const dataDir = join(appRoot, 'data')
  const publicDir = join(appRoot, 'public')
  mkdirSync(dataDir, { recursive: true })
  mkdirSync(publicDir, { recursive: true })
  return createMpzContentIo({ appRoot, stationsPath, backupPath })
}

describe('mpz-content-io', () => {
  const temps: string[] = []

  afterEach(() => {
    vi.restoreAllMocks()
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  it('readStations liefert Raw-Inhalt', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    writeFileSync(io.getPaths().stationsPath, JSON.stringify(fixture), 'utf8')
    const data = await io.readStations()
    expect(data.stations).toHaveLength(12)
  })

  it('Round-trip behält Extra-Feld bei strict:false', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    const draft = structuredClone(fixture) as StationsFile & {
      stations: Array<Record<string, unknown>>
    }
    const medien = draft.stations[0]!.medien as Array<Record<string, unknown>>
    medien[0]!._experimental = 'behalten'
    writeFileSync(io.getPaths().stationsPath, serializeStationsFile(draft), 'utf8')

    const read = await io.readStations()
    await io.writeStations(read, { strict: false, makeBackup: false })
    const again = await io.readStations()
    const againMedien = again.stations[0]!.medien as Array<Record<string, unknown>>
    expect(againMedien[0]!._experimental).toBe('behalten')
  })

  it('readStations wirft bei kaputtem JSON', async () => {
    const io = makeTempIo()
    temps.push(io.getPaths().appRoot)
    writeFileSync(io.getPaths().stationsPath, '{invalid', 'utf8')
    await expect(io.readStations()).rejects.toMatchObject({ code: 'IO' })
  })

  it('writeStations strict:true aktualisiert Datei und .bak', async () => {
    const io = makeTempIo()
    const { stationsPath, backupPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    writeFileSync(stationsPath, serializeStationsFile(fixture), 'utf8')
    const original = readFileSync(stationsPath, 'utf8')

    const next = structuredClone(fixture)
    next.stations[0]!.titel = 'Geändert für Test'
    await io.writeStations(next, { strict: true, makeBackup: true, validateAssets: false })

    expect(readFileSync(stationsPath, 'utf8')).toContain('Geändert für Test')
    expect(readFileSync(backupPath, 'utf8')).toBe(original)
  })

  it('makeBackup:false erzeugt kein .bak', async () => {
    const io = makeTempIo()
    const { stationsPath, backupPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    writeFileSync(stationsPath, serializeStationsFile(fixture), 'utf8')
    await io.writeStations(fixture, { strict: true, makeBackup: false, validateAssets: false })
    expect(existsSync(backupPath)).toBe(false)
  })

  it('atomarer Write hinterlässt keine .tmp-Datei', async () => {
    const io = makeTempIo()
    const { stationsPath, appRoot } = io.getPaths()
    temps.push(appRoot)
    writeFileSync(stationsPath, serializeStationsFile(fixture), 'utf8')
    await io.writeStations(fixture, { strict: true, makeBackup: false, validateAssets: false })
    const { readdirSync } = await import('node:fs')
    const files = readdirSync(join(appRoot, 'data'))
    expect(files.some((f) => f.endsWith('.tmp'))).toBe(false)
  })

  it('strict:true wirft VALIDATION ohne FS-Änderung', async () => {
    const io = makeTempIo()
    const { stationsPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    const before = serializeStationsFile(fixture)
    writeFileSync(stationsPath, before, 'utf8')

    const broken = structuredClone(fixture)
    broken.stations.pop()

    await expect(
      io.writeStations(broken, { strict: true, validateAssets: false }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(readFileSync(stationsPath, 'utf8')).toBe(before)
  })

  it('strict:false schreibt 11 Stationen', async () => {
    const io = makeTempIo()
    const { stationsPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    writeFileSync(stationsPath, serializeStationsFile(fixture), 'utf8')
    const draft = structuredClone(fixture)
    draft.stations.pop()
    await io.writeStations(draft, { strict: false, makeBackup: false, validateAssets: false })
    const parsed = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile
    expect(parsed.stations).toHaveLength(11)
  })

  it('validateAssets:true lehnt fehlendes Asset vor Write ab', async () => {
    const io = makeTempIo()
    const { stationsPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    const before = serializeStationsFile(fixture)
    writeFileSync(stationsPath, before, 'utf8')

    const broken = structuredClone(fixture)
    broken.stations[0]!.medien[0]!.quelle = '/media/klassenzimmer/audio/fehlt-definitiv.mp3'

    await expect(
      io.writeStations(broken, { strict: true, validateAssets: true }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    expect(readFileSync(stationsPath, 'utf8')).toBe(before)
  })

  it('postValidate:true rollt bei Fehler auf touchedSlug zurück', async () => {
    const io = makeTempIo()
    const { stationsPath, backupPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    const before = serializeStationsFile(fixture)
    writeFileSync(stationsPath, before, 'utf8')

    const broken = structuredClone(fixture)
    const klassenzimmer = broken.stations.find((s) => s.slug === 'klassenzimmer')!
    klassenzimmer.medien[0]!.quelle = '/media/klassenzimmer/audio/fehlt-post-validate.mp3'

    await expect(
      io.writeStations(broken, {
        strict: true,
        makeBackup: true,
        postValidate: true,
        touchedSlug: 'klassenzimmer',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })

    expect(readFileSync(stationsPath, 'utf8')).toBe(before)
    expect(readFileSync(backupPath, 'utf8')).toBe(before)
  })

  it('postValidate:true behält Write bei Fremd-Slug-Fehler (touchedSlug)', async () => {
    const io = makeTempIo()
    const { stationsPath } = io.getPaths()
    temps.push(io.getPaths().appRoot)
    writeFileSync(stationsPath, serializeStationsFile(fixture), 'utf8')

    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      errors: ['Station kunst (bild): Datei fehlt — /stations/kunst.jpg'],
      warnings: [],
      bySlug: mpzStationsValidation.groupMessagesBySlug(
        ['Station kunst (bild): Datei fehlt — /stations/kunst.jpg'],
        [],
      ),
    })

    const next = structuredClone(fixture)
    const musik = next.stations.find((s) => s.slug === 'musik')!
    musik.titel = 'Musikraum Test-Titel'

    await io.writeStations(next, {
      strict: true,
      makeBackup: true,
      postValidate: true,
      touchedSlug: 'musik',
    })

    const parsed = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile
    const musikAfter = parsed.stations.find((s) => s.slug === 'musik')
    expect(musikAfter?.titel).toBe('Musikraum Test-Titel')
  })

  it('canonicalize:true sortiert nach Hub-Reihenfolge', () => {
    const shuffled = structuredClone(fixture)
    shuffled.stations = [...shuffled.stations].reverse()
    const sorted = canonicalizeStationsFile(shuffled)
    expect(sorted.stations[0]!.slug).toBe('klassenzimmer')
    expect(sorted.stations[1]!.slug).toBe('musik')
  })

  it('serializeStationsFile endet mit Newline und 2-Space-Indent', () => {
    const out = serializeStationsFile(fixture)
    expect(out.endsWith('\n')).toBe(true)
    expect(out.includes('\n  ')).toBe(true)
  })
})

describe('validateStationAssets', () => {
  it('meldet fehlende Datei als error', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'mpz-assets-'))
    const broken = structuredClone(fixture)
    broken.stations[0]!.medien[0]!.quelle = '/media/nicht-da/datei.mp3'
    const { errors } = validateStationAssets(broken, { appRoot })
    expect(errors.some((e) => e.includes('Datei fehlt'))).toBe(true)
  })
})
