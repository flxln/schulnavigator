import { describe, expect, it } from 'vitest'
import { expandHitRect, hitRectsOverlap } from '@/lib/schoolhouse-hub-hit'
import {
  buildHubStations,
  getHubMapping,
  HUB_SLOTS,
  HUB_SLUG_MAP,
  HUB_VIEWBOX,
  listHubStationFrames,
} from '@/lib/schoolhouse-hub-map'
import { getAllStations } from '@/lib/stations'

describe('schoolhouse-hub-map', () => {
  it('mappt 11 Slugs auf 11 eindeutige Slots inkl. Portal=klassenzimmer', () => {
    const hub = buildHubStations(getAllStations())
    expect(hub).toHaveLength(11)

    const portal = hub.find((s) => s.slug === 'klassenzimmer')
    expect(portal?.slotId).toBe('portal')
    expect(portal?.kind).toBe('portal')
    expect(portal?.nr).toBe(1)

    const slotIds = new Set(hub.map((s) => s.slotId))
    expect(slotIds.size).toBe(11)
  })

  it('definiert 4 Deko-Slots ohne Slug-Zuordnung', () => {
    const deko = Object.entries(HUB_SLOTS).filter(([, s]) => s.kind === 'deko')
    expect(deko).toHaveLength(4)
    const usedDeko = Object.values(HUB_SLUG_MAP).map((m) => m.slotId)
    for (const [id] of deko) {
      expect(usedDeko).not.toContain(id)
    }
  })

  it('liefert Hex-Akzente ohne CSS-Variablen', () => {
    const hub = buildHubStations(getAllStations())
    for (const s of hub) {
      expect(s.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(s.visitedGlassFill).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('deckt alle Stations-Slugs aus stations.json ab', () => {
    const slugs = getAllStations().map((s) => s.slug)
    for (const slug of slugs) {
      expect(slug in HUB_SLUG_MAP).toBe(true)
    }
  })

  it('wirft bei unbekanntem slug', () => {
    expect(() => getHubMapping('unbekannt')).toThrow()
  })
})

describe('expandHitRect', () => {
  it('erzeugt bei 320px Viewport keine überlappenden Trefferflächen', () => {
    const hub = buildHubStations(getAllStations())
    const frames = listHubStationFrames(hub)
    const pxPerUnit = 320 / HUB_VIEWBOX.w
    const hits = hub.map((station, i) => {
      const neighbors = frames.filter((_, j) => j !== i)
      return expandHitRect(station.frame, neighbors, pxPerUnit)
    })

    for (let i = 0; i < hits.length; i += 1) {
      for (let j = i + 1; j < hits.length; j += 1) {
        expect(
          hitRectsOverlap(hits[i], hits[j]),
          `Overlap zwischen Slot ${hub[i].slotId} und ${hub[j].slotId}`,
        ).toBe(false)
      }
    }
  })
})
