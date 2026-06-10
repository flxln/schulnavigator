import { GS39_BRAND_HEX, GS39_STATION_ACCENT_HEX } from '@/lib/gs39-brand-colors'
import { mixHex } from '@/lib/gs39-hex-blend'
import type { Station } from '@/lib/types'

/**
 * Slot-frame-Koordinaten gültig nur für viewBox-Revision `0 0 1086.5 1453.9`
 * (siehe `scripts/prepare-hub-outline.mjs`). Bei Asset-Re-Export Frames neu vermessen.
 * Zuordnung Vorschlag 2026-06-10 — Portal = klassenzimmer.
 */

export type HubSlotKind = 'fenster' | 'portal' | 'deko'
export type HubFrame = readonly [x: number, y: number, w: number, h: number]

export const HUB_VIEWBOX = { w: 1086.5, h: 1453.9 } as const

type SlotDef = {
  frame: HubFrame
  kind: HubSlotKind
}

export const HUB_SLOTS: Record<string, SlotDef> = {
  portal: { kind: 'portal', frame: [469.65, 909.13, 156.42, 191.06] },
  'fenster-ul-2': { kind: 'fenster', frame: [110, 338.09, 67.24, 118.08] },
  'fenster-ul-1': { kind: 'fenster', frame: [293.21, 327.55, 64.84, 124.98] },
  'fenster-uc-l': { kind: 'fenster', frame: [484.39, 328.35, 53.34, 124.98] },
  'fenster-uc-r': { kind: 'fenster', frame: [553.44, 326.02, 53.34, 124.98] },
  'fenster-ur-1': { kind: 'fenster', frame: [734.31, 327.73, 59.95, 124.98] },
  'fenster-ur-2': { kind: 'fenster', frame: [913.11, 339.77, 59.95, 124.98] },
  'fenster-ll': { kind: 'fenster', frame: [298.15, 554.08, 54.47, 144.09] },
  'fenster-lc': { kind: 'fenster', frame: [484.53, 555.58, 54.47, 144.09] },
  'fenster-rc': { kind: 'fenster', frame: [554.99, 555.58, 54.47, 144.09] },
  'fenster-lr': { kind: 'fenster', frame: [741.6, 565.08, 54.47, 144.09] },
  'deko-dach': { kind: 'deko', frame: [218.62, 207.78, 654.08, 71.27] },
  'deko-vestibuel': { kind: 'deko', frame: [433.13, 765.98, 223.18, 118.52] },
  'deko-fluegel-l': { kind: 'deko', frame: [12.25, 341.17, 55.88, 118.08] },
  'deko-fluegel-r': { kind: 'deko', frame: [1019.88, 339.77, 59.95, 124.98] },
}

export type HubSlugMapping = {
  slotId: string
  nr: number
}

export const HUB_SLUG_MAP: Record<string, HubSlugMapping> = {
  klassenzimmer: { slotId: 'portal', nr: 1 },
  musik: { slotId: 'fenster-ul-1', nr: 2 },
  daz: { slotId: 'fenster-uc-l', nr: 3 },
  kunst: { slotId: 'fenster-uc-r', nr: 4 },
  'pc-raum': { slotId: 'fenster-ur-1', nr: 5 },
  lesewelt: { slotId: 'fenster-ur-2', nr: 6 },
  werken: { slotId: 'fenster-ll', nr: 7 },
  speiseraum: { slotId: 'fenster-lc', nr: 8 },
  hort: { slotId: 'fenster-rc', nr: 9 },
  turnhalle: { slotId: 'fenster-lr', nr: 10 },
  schulsozialarbeit: { slotId: 'fenster-ul-2', nr: 11 },
}

export type HubStation = {
  slug: string
  titel: string
  nr: number
  slotId: string
  kind: HubSlotKind
  frame: HubFrame
  accent: string
  visitedGlassFill: string
}

const SKY_50 = GS39_BRAND_HEX.sky50

function accentForSlug(slug: string): string {
  const hex = GS39_STATION_ACCENT_HEX[slug]
  if (!hex) {
    throw new Error(`schoolhouse-hub-map: kein Akzent für slug "${slug}"`)
  }
  return hex
}

function buildVisuals(accent: string) {
  return {
    accent,
    visitedGlassFill: mixHex(accent, SKY_50, 0.36),
  }
}

export function getHubMapping(slug: string): HubSlugMapping & SlotDef {
  const mapping = HUB_SLUG_MAP[slug]
  if (!mapping) {
    throw new Error(`schoolhouse-hub-map: unbekannter slug "${slug}"`)
  }
  const slot = HUB_SLOTS[mapping.slotId]
  if (!slot) {
    throw new Error(`schoolhouse-hub-map: unbekannter slotId "${mapping.slotId}"`)
  }
  return { ...mapping, ...slot }
}

export function buildHubStations(
  stations: readonly Station[],
): readonly HubStation[] {
  if (stations.length !== Object.keys(HUB_SLUG_MAP).length) {
    throw new Error(
      `schoolhouse-hub-map: erwartet ${Object.keys(HUB_SLUG_MAP).length} Stationen, erhalten ${stations.length}`,
    )
  }

  const slotIds = new Set<string>()
  const out: HubStation[] = []

  for (const station of stations) {
    const { slotId, nr, frame, kind } = getHubMapping(station.slug)
    if (slotIds.has(slotId)) {
      throw new Error(
        `schoolhouse-hub-map: doppelter slotId "${slotId}" für slug "${station.slug}"`,
      )
    }
    slotIds.add(slotId)
    out.push({
      slug: station.slug,
      titel: station.titel,
      nr,
      slotId,
      kind,
      frame,
      ...buildVisuals(accentForSlug(station.slug)),
    })
  }

  out.sort((a, b) => a.nr - b.nr)
  return out
}

export function listHubStationFrames(
  hubStations: readonly HubStation[],
): HubFrame[] {
  return hubStations.map((s) => s.frame)
}
