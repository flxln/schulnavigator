import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import { studioDemoKlassenzimmerStation } from '@/lib/test-fixtures/studio-demo-klassenzimmer'
import type { StationsFile } from '@/lib/types'
import { validateStationsFile } from '@/lib/validate-stations'
import { validateStationAssets } from '@/scripts/validate-station-assets'

describe('validateStationAssets structure mode', () => {
  const temps: string[] = []

  afterEach(() => {
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  it('grün ohne Bahn-B-Dateien wenn checkFiles false', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'struct-val-'))
    temps.push(appRoot)
    mkdirSync(join(appRoot, 'data'), { recursive: true })
    const data = structuredClone(raw) as StationsFile
    const { errors } = validateStationAssets(data, { appRoot, checkFiles: false })
    expect(errors).toEqual([])
  })

  it('rot bei ungültigem Pfad wenn checkFiles false', () => {
    expect(() =>
      validateStationsFile({
        stations: [
          {
            slug: 'test',
            titel: 'Test',
            medien: [{ id: 'm1', typ: 'foto', quelle: 'ohne-fuehrenden-slash.jpg' }],
          },
        ],
      }),
    ).toThrow()
  })

  it('rot bei fehlender Datei wenn checkFiles true', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'struct-val-'))
    temps.push(appRoot)
    mkdirSync(join(appRoot, 'data'), { recursive: true })
    const data: StationsFile = {
      stations: [structuredClone(studioDemoKlassenzimmerStation)],
    }
    const { errors } = validateStationAssets(data, { appRoot, checkFiles: true })
    expect(errors.some((e) => e.includes('Datei fehlt'))).toBe(true)
  })
})
