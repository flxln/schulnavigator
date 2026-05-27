import { describe, expect, it } from 'vitest'
import {
  buildIsometricHubStations,
  getIsometricMapping,
  ISOMETRIC_SLUG_MAP,
  listIsometricRooms,
} from '@/lib/schoolhouse-isometric-map'
import { getAllStations } from '@/lib/stations'

describe('schoolhouse-isometric-map', () => {
  it('mappt 11 Slugs auf 11 eindeutige rooms mit genau einem gym und garden', () => {
    const hub = buildIsometricHubStations(getAllStations())
    expect(hub).toHaveLength(11)

    const rooms = listIsometricRooms(hub)
    expect(new Set(rooms).size).toBe(11)
    expect(rooms.filter((r) => r === 'gym')).toHaveLength(1)
    expect(rooms.filter((r) => r === 'garden')).toHaveLength(1)

    const turn = hub.find((s) => s.slug === 'turnhalle')
    expect(turn?.room).toBe('gym')
    expect(turn?.nr).toBe(10)

    const garden = hub.find((s) => s.slug === 'schulsozialarbeit')
    expect(garden?.room).toBe('garden')
  })

  it('liefert Hex-Akzente ohne CSS-Variablen', () => {
    const hub = buildIsometricHubStations(getAllStations())
    for (const s of hub) {
      expect(s.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(s.visitedGlassFill).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('deckt alle Stations-Slugs aus stations.json ab', () => {
    const slugs = getAllStations().map((s) => s.slug)
    for (const slug of slugs) {
      expect(ISOMETRIC_SLUG_MAP[slug]).toBeDefined()
    }
  })

  it('wirft bei unbekanntem slug', () => {
    expect(() => getIsometricMapping('unbekannt')).toThrow()
  })
})
