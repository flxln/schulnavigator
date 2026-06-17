import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import {
  globalValidationErrors,
  groupMessagesBySlug,
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

  it('shouldRollbackPostValidate: globaler Strukturfehler → immer Rollback', () => {
    const validation = validateStationsContent(
      { stations: fixture.stations.slice(0, 11) },
      '/tmp',
    )
    expect(globalValidationErrors(validation.errors).length).toBeGreaterThan(0)
    expect(shouldRollbackPostValidate(validation, 'klassenzimmer')).toBe(true)
  })

  it('shouldRollbackPostValidate: Fremd-Slug-Fehler ohne touchedSlug → Rollback', () => {
    const validation = {
      errors: ['Station kunst (bild): Datei fehlt'],
      warnings: [],
      bySlug: groupMessagesBySlug(['Station kunst (bild): Datei fehlt'], []),
    }
    expect(shouldRollbackPostValidate(validation)).toBe(true)
    expect(shouldRollbackPostValidate(validation, 'klassenzimmer')).toBe(false)
  })

  it('shouldRollbackPostValidate: touchedSlug mit eigenem Fehler → Rollback', () => {
    const validation = {
      errors: ['Station klassenzimmer (medium x): Datei fehlt'],
      warnings: [],
      bySlug: groupMessagesBySlug(
        ['Station klassenzimmer (medium x): Datei fehlt'],
        [],
      ),
    }
    expect(shouldRollbackPostValidate(validation, 'klassenzimmer')).toBe(true)
  })

  it('shouldRollbackPostValidate: nur Warnings → kein Rollback', () => {
    const validation = {
      errors: [],
      warnings: ['Station kunst: warn'],
      bySlug: groupMessagesBySlug([], ['Station kunst: warn']),
    }
    expect(shouldRollbackPostValidate(validation)).toBe(false)
  })
})
