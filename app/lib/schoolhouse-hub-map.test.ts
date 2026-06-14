import { describe, expect, it } from 'vitest'
import { expandHitRect, hitRectsOverlap } from '@/lib/schoolhouse-hub-hit'
import {
  buildHubStations,
  getHubMapping,
  HUB_SLOTS,
  HUB_SLUG_MAP,
  HUB_VIEWBOX,
  listHubStationHitFrames,
} from '@/lib/schoolhouse-hub-map'
import { getAllStations } from '@/lib/stations'

describe('schoolhouse-hub-map', () => {
  it('mappt 12 Slugs auf 12 eindeutige Slots inkl. Portal=klassenzimmer', () => {
    const hub = buildHubStations(getAllStations())
    expect(hub).toHaveLength(12)

    const portal = hub.find((s) => s.slug === 'klassenzimmer')
    expect(portal?.slotId).toBe('portal')
    expect(portal?.kind).toBe('portal')
    expect(portal?.nr).toBe(1)

    const turnhalle = hub.find((s) => s.slug === 'turnhalle')
    expect(turnhalle?.slotId).toBe('wegweiser-oben')
    expect(turnhalle?.kind).toBe('wegweiser')

    const schulhof = hub.find((s) => s.slug === 'schulhof')
    expect(schulhof?.slotId).toBe('wegweiser-unten')
    expect(schulhof?.kind).toBe('wegweiser')

    const slotIds = new Set(hub.map((s) => s.slotId))
    expect(slotIds.size).toBe(12)
  })

  it('definiert 5 Deko-Slots ohne Slug-Zuordnung', () => {
    const deko = Object.entries(HUB_SLOTS).filter(([, s]) => s.kind === 'deko')
    expect(deko).toHaveLength(5)
    const usedDeko = Object.values(HUB_SLUG_MAP).map((m) => m.slotId)
    for (const [id] of deko) {
      expect(usedDeko).not.toContain(id)
    }
  })

  it('liefert Hex-Akzente ohne CSS-Variablen', () => {
    const hub = buildHubStations(getAllStations())
    for (const s of hub) {
      expect(s.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(s.visitedGlassFill).toMatch(
        /^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 0\.28\)$/,
      )
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

  it('snapshot Wegweiser-Geometrie (frame/hitFrame/rotation)', () => {
    const oben = HUB_SLOTS['wegweiser-oben']
    const unten = HUB_SLOTS['wegweiser-unten']
    expect(oben).toMatchObject({
      frame: [278.53, 1010.53, 142.1, 79.66],
      hitFrame: [299.84, 1022.48, 99.47, 55.76],
      rotation: -9.85,
    })
    expect(unten).toMatchObject({
      frame: [250.83, 1080.3, 138.71, 68.93],
      hitFrame: [271.64, 1090.64, 97.1, 48.25],
      rotation: 4.96,
    })
  })

  it('Wegweiser-hitFrames überlappen Portal und einander nicht', () => {
    const portal = HUB_SLOTS.portal.frame
    const obenHit = HUB_SLOTS['wegweiser-oben'].hitFrame!
    const untenHit = HUB_SLOTS['wegweiser-unten'].hitFrame!
    expect(hitRectsOverlap(obenHit, portal)).toBe(false)
    expect(hitRectsOverlap(untenHit, portal)).toBe(false)
    expect(hitRectsOverlap(obenHit, untenHit)).toBe(false)
  })
})

describe('expandHitRect', () => {
  it('erzeugt bei 320px Viewport keine überlappenden Trefferflächen', () => {
    const hub = buildHubStations(getAllStations())
    const frames = listHubStationHitFrames(hub)
    const pxPerUnit = 320 / HUB_VIEWBOX.w
    const hits = hub.map((station, i) => {
      const neighbors = frames.filter((_, j) => j !== i)
      return expandHitRect(station.hitFrame, neighbors, pxPerUnit)
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
