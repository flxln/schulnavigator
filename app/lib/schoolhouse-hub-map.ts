import hubSlugMapData from '../data/hub-slug-map.json'
import { getStationAccentHex, resetStationAccentsCacheForTests } from '@/lib/gs39-brand-colors'
import { resetStationIconsCacheForTests } from '@/lib/station-icons'
import {
  HUB_SLOTS,
  HUB_VIEWBOX,
  type HubFrame,
  type HubPoint,
  type HubSlotDef,
  type HubSlotKind,
} from '@/lib/hub-slot-definitions'
import { hexToRgba, mixHex } from '@/lib/gs39-hex-blend'
import {
  validateHubSlugMapContent,
  type HubSlugMapFile,
  type HubSlugMapping,
} from '@/lib/mpz-hub-config-validation'
import type { Station } from '@/lib/types'

export type { HubFrame, HubPoint, HubSlotKind }
export { HUB_SLOTS, HUB_VIEWBOX }
export type { HubSlugMapping }

/**
 * Portal = klassenzimmer; Wegweiser = Außen-Stationen (ADR-020).
 */

export type HubSlug =
  | 'klassenzimmer'
  | 'musik'
  | 'daz'
  | 'kunst'
  | 'pc-raum'
  | 'lesewelt'
  | 'werken'
  | 'speiseraum'
  | 'hort'
  | 'turnhalle'
  | 'schulsozialarbeit'
  | 'schulhof'

export const KNOWN_HUB_SLUGS: readonly HubSlug[] = [
  'klassenzimmer',
  'musik',
  'daz',
  'kunst',
  'pc-raum',
  'lesewelt',
  'werken',
  'speiseraum',
  'hort',
  'turnhalle',
  'schulsozialarbeit',
  'schulhof',
]

export const FALLBACK_HUB_SLUG_MAP: Record<HubSlug, HubSlugMapping> = {
  klassenzimmer: { slotId: 'portal', nr: 1 },
  musik: { slotId: 'fenster-ul-1', nr: 2 },
  daz: { slotId: 'fenster-uc-l', nr: 3 },
  kunst: { slotId: 'fenster-uc-r', nr: 4 },
  'pc-raum': { slotId: 'fenster-ur-1', nr: 5 },
  lesewelt: { slotId: 'fenster-ur-2', nr: 6 },
  werken: { slotId: 'fenster-ll', nr: 7 },
  speiseraum: { slotId: 'fenster-lc', nr: 8 },
  hort: { slotId: 'fenster-rc', nr: 9 },
  turnhalle: { slotId: 'wegweiser-oben', nr: 10 },
  schulsozialarbeit: { slotId: 'fenster-ul-2', nr: 11 },
  schulhof: { slotId: 'wegweiser-unten', nr: 12 },
}

function parseStrictHubSlugMap(raw: unknown): Record<string, HubSlugMapping> {
  const errors = validateHubSlugMapContent(raw)
  if (errors.length > 0) {
    throw new Error(`hub-slug-map.json: ${errors[0]}`)
  }
  return (raw as HubSlugMapFile).mappings
}

function parseLoadedHubSlugMap(raw: unknown): Record<string, HubSlugMapping> {
  try {
    return parseStrictHubSlugMap(raw)
  } catch {
    return { ...FALLBACK_HUB_SLUG_MAP }
  }
}

let cachedHubSlugMap: Record<string, HubSlugMapping> | null = null

export function getHubSlugMap(): Record<string, HubSlugMapping> {
  if (cachedHubSlugMap === null) {
    cachedHubSlugMap = parseLoadedHubSlugMap(hubSlugMapData)
  }
  return cachedHubSlugMap
}

/** @deprecated Nutze getHubSlugMap() */
export const HUB_SLUG_MAP: Record<HubSlug, HubSlugMapping> =
  getHubSlugMap() as Record<HubSlug, HubSlugMapping>

/** Kanonische Reihenfolge der 12 Hub-Stationen (MPZ Studio, Validierung). */
export const MPZ_HUB_SLUGS: HubSlug[] = [...KNOWN_HUB_SLUGS]

export function getHubSlugOrder(): string[] {
  const map = getHubSlugMap()
  return Object.entries(map)
    .sort(([, a], [, b]) => a.nr - b.nr)
    .map(([slug]) => slug)
}

export function isHubSlug(slug: string): slug is HubSlug {
  return slug in getHubSlugMap()
}

export type HubStation = {
  slug: string
  titel: string
  nr: number
  slotId: string
  kind: HubSlotKind
  frame: HubFrame
  hitFrame: HubFrame
  chipAnchor?: HubPoint
  rotation?: number
  overlayFrame?: HubFrame
  overlayTranslate?: HubPoint
  accent: string
  visitedGlassFill: string
}

const SKY_50 = '#e4f3fc'
const GLASS_FILL_ALPHA = 0.28

function buildVisuals(accent: string) {
  return {
    accent,
    visitedGlassFill: hexToRgba(mixHex(accent, SKY_50, 0.52), GLASS_FILL_ALPHA),
  }
}

function resolveHitFrame(slot: HubSlotDef): HubFrame {
  return slot.hitFrame ?? slot.frame
}

export function getHubMapping(
  slug: string,
  hubSlugMap: Record<string, HubSlugMapping> = getHubSlugMap(),
): HubSlugMapping & HubSlotDef {
  const mapping = hubSlugMap[slug]
  if (!mapping) {
    throw new Error(`schoolhouse-hub-map: unbekannter slug "${slug}"`)
  }
  const slot = HUB_SLOTS[mapping.slotId]
  if (!slot) {
    throw new Error(`schoolhouse-hub-map: unbekannter slotId "${mapping.slotId}"`)
  }
  return { ...mapping, ...slot }
}

export type BuildHubStationsOptions = {
  hubSlugMap?: Record<string, HubSlugMapping>
}

export function buildHubStations(
  stations: readonly Station[],
  options?: BuildHubStationsOptions,
): readonly HubStation[] {
  const hubSlugMap = options?.hubSlugMap ?? getHubSlugMap()
  const expectedCount = Object.keys(hubSlugMap).length

  if (stations.length !== expectedCount) {
    throw new Error(
      `schoolhouse-hub-map: erwartet ${expectedCount} Stationen, erhalten ${stations.length}`,
    )
  }

  const slotIds = new Set<string>()
  const out: HubStation[] = []

  for (const station of stations) {
    const mapping = getHubMapping(station.slug, hubSlugMap)
    const { slotId, nr, frame, kind, chipAnchor, rotation, overlayFrame, overlayTranslate } =
      mapping
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
      hitFrame: resolveHitFrame(mapping),
      chipAnchor,
      rotation,
      overlayFrame,
      overlayTranslate,
      ...buildVisuals(getStationAccentHex(station.slug)),
    })
  }

  out.sort((a, b) => a.nr - b.nr)
  return out
}

export function listHubStationHitFrames(
  hubStations: readonly HubStation[],
): HubFrame[] {
  return hubStations.map((s) => s.hitFrame)
}

/** @deprecated Nutze listHubStationHitFrames für Kollisions-Tests */
export function listHubStationFrames(
  hubStations: readonly HubStation[],
): HubFrame[] {
  return listHubStationHitFrames(hubStations)
}

export function resetHubConfigCacheForTests(): void {
  cachedHubSlugMap = null
  resetStationAccentsCacheForTests()
  resetStationIconsCacheForTests()
}
