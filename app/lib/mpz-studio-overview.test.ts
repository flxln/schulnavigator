import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import {
  buildStationOverviews,
  groupMessagesBySlug,
  MPZ_HUB_SLUGS,
} from '@/lib/mpz-studio-overview'
import type { StationsFile } from '@/lib/types'

const fixture = raw as StationsFile

describe('mpz-studio-overview', () => {
  it('MPZ_HUB_SLUGS hat 12 Einträge in Hub-Reihenfolge', () => {
    expect(MPZ_HUB_SLUGS).toHaveLength(12)
    expect(MPZ_HUB_SLUGS[0]).toBe('klassenzimmer')
    expect(MPZ_HUB_SLUGS[11]).toBe('schulhof')
  })

  it('groupMessagesBySlug ordnet Station-Nachrichten zu', () => {
    const bySlug = groupMessagesBySlug(
      ['Station kunst (bild): Datei fehlt — /x.jpg'],
      ['Station daz (medium m1): warn'],
    )
    expect(bySlug.kunst?.errors).toHaveLength(1)
    expect(bySlug.daz?.warnings).toHaveLength(1)
  })

  it('buildStationOverviews liefert 12 Stationen mit Hub-Nr', () => {
    const summaries = buildStationOverviews(fixture, {}, '/tmp/app')
    expect(summaries).toHaveLength(12)
    const klassenzimmer = summaries.find((s) => s.slug === 'klassenzimmer')
    expect(klassenzimmer?.hubNr).toBe(1)
    expect(klassenzimmer?.viewer).toBe('equirectangular')
  })

  it('fehlende Station → error', () => {
    const partial: StationsFile = {
      stations: fixture.stations.filter((s) => s.slug !== 'schulhof'),
    }
    const summaries = buildStationOverviews(partial, {}, '/tmp/app')
    const schulhof = summaries.find((s) => s.slug === 'schulhof')
    expect(schulhof?.health).toBe('error')
  })
})
