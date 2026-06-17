import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import {
  globalValidationErrors,
  groupMessagesBySlug,
  mergeValidationErrors,
  shouldRollbackPostValidate,
  STATION_MSG_RE,
  validateStationsContent,
} from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'
import { validateStationAssets } from '@/scripts/validate-station-assets'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const fixture = raw as StationsFile

describe('mpz-stations-validation', () => {
  it('groupMessagesBySlug ordnet Station-Nachrichten zu', () => {
    const bySlug = groupMessagesBySlug(
      ['Station kunst (bild): Datei fehlt — /x.jpg'],
      ['Station daz (medium m1): warn'],
    )
    expect(bySlug.kunst?.errors).toHaveLength(1)
    expect(bySlug.daz?.warnings).toHaveLength(1)
  })

  it('validateStationsContent trennt Struktur- und Asset-Fehler', () => {
    const partial: StationsFile = { stations: fixture.stations.slice(0, 11) }
    const appRoot = mkdtempSync(join(tmpdir(), 'mpz-val-'))
    const result = validateStationsContent(partial, appRoot)
    expect(result.structureErrors.length).toBeGreaterThan(0)
    expect(result.assetErrors.length).toBeGreaterThanOrEqual(0)
    expect(mergeValidationErrors(result)).toEqual([
      ...result.structureErrors,
      ...result.assetErrors,
    ])
  })

  it('jeder validateStationAssets-Fehler matcht STATION_MSG_RE (B1-Vertrag)', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'mpz-val-'))
    const broken = structuredClone(fixture)
    broken.stations[0]!.medien[0]!.quelle = '/media/nicht-da/datei.mp3'
    const { errors } = validateStationAssets(broken, { appRoot })
    expect(errors.length).toBeGreaterThan(0)
    for (const msg of errors) {
      expect(STATION_MSG_RE.test(msg)).toBe(true)
    }
  })

  it('shouldRollbackPostValidate: Strukturfehler → immer Rollback', () => {
    const validation = validateStationsContent(
      { stations: fixture.stations.slice(0, 11) },
      '/tmp',
    )
    expect(validation.structureErrors.length).toBeGreaterThan(0)
    expect(shouldRollbackPostValidate(validation, ['klassenzimmer'])).toBe(true)
  })

  it('shouldRollbackPostValidate: Fremd-Slug-Fehler mit touchedSlugs → kein Rollback', () => {
    const validation = {
      structureErrors: [],
      assetErrors: ['Station kunst (bild): Datei fehlt'],
      warnings: [],
      bySlug: groupMessagesBySlug(['Station kunst (bild): Datei fehlt'], []),
    }
    expect(shouldRollbackPostValidate(validation)).toBe(true)
    expect(shouldRollbackPostValidate(validation, ['klassenzimmer'])).toBe(false)
  })

  it('shouldRollbackPostValidate: touchedSlugs mit eigenem Fehler → Rollback', () => {
    const validation = {
      structureErrors: [],
      assetErrors: ['Station klassenzimmer (medium x): Datei fehlt'],
      warnings: [],
      bySlug: groupMessagesBySlug(
        ['Station klassenzimmer (medium x): Datei fehlt'],
        [],
      ),
    }
    expect(shouldRollbackPostValidate(validation, ['klassenzimmer'])).toBe(true)
  })

  it('shouldRollbackPostValidate: nur Warnings → kein Rollback', () => {
    const validation = {
      structureErrors: [],
      assetErrors: [],
      warnings: ['Station kunst: warn'],
      bySlug: groupMessagesBySlug([], ['Station kunst: warn']),
    }
    expect(shouldRollbackPostValidate(validation)).toBe(false)
  })

  it('globalValidationErrors erfasst Strukturmeldungen', () => {
    const msgs = ['stations.json: foo', 'Station kunst (bild): fehlt']
    const global = globalValidationErrors(msgs)
    expect(global).toContain('stations.json: foo')
    expect(global).not.toContain('Station kunst (bild): fehlt')
  })
})
