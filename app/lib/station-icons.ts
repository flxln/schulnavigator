import stationIconsData from '../data/station-icons.json'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import { resolveLucideIcon } from '@/lib/lucide-icon-registry'
import {
  validateStationIconsContent,
  type StationIconsFile,
} from '@/lib/mpz-hub-config-validation'
import type { HubSlug } from '@/lib/schoolhouse-hub-map'
import type { LucideIcon } from 'lucide-react'

export type StationIconDef =
  | { type: 'lucide'; Icon: LucideIcon }
  | { type: 'image'; src: string; alt?: string }

const FALLBACK_STATION_ICONS: Record<string, { type: 'lucide'; name: string }> = {
  klassenzimmer: { type: 'lucide', name: 'GraduationCap' },
  musik: { type: 'lucide', name: 'Music' },
  daz: { type: 'lucide', name: 'Languages' },
  kunst: { type: 'lucide', name: 'Palette' },
  'pc-raum': { type: 'lucide', name: 'Monitor' },
  lesewelt: { type: 'lucide', name: 'BookOpen' },
  werken: { type: 'lucide', name: 'Hammer' },
  speiseraum: { type: 'lucide', name: 'UtensilsCrossed' },
  hort: { type: 'lucide', name: 'Home' },
  turnhalle: { type: 'lucide', name: 'PersonStanding' },
  schulsozialarbeit: { type: 'lucide', name: 'HeartHandshake' },
  schulhof: { type: 'lucide', name: 'Trees' },
}

function resolveIconJson(entry: { type: 'lucide'; name: string }): StationIconDef | null {
  const Icon = resolveLucideIcon(entry.name)
  if (!Icon) {
    return null
  }
  return { type: 'lucide', Icon }
}

function parseLoadedIcons(raw: unknown): Record<string, StationIconDef> {
  const errors = validateStationIconsContent(raw)
  if (errors.length > 0) {
    const fallback: Record<string, StationIconDef> = {}
    for (const [slug, entry] of Object.entries(FALLBACK_STATION_ICONS)) {
      const def = resolveIconJson(entry)
      if (def) {
        fallback[slug] = def
      }
    }
    return fallback
  }

  const file = raw as StationIconsFile
  const out: Record<string, StationIconDef> = {}
  for (const [slug, entry] of Object.entries(file.icons)) {
    const def = resolveIconJson(entry)
    if (def) {
      out[slug] = def
    }
  }
  return out
}

let cachedIcons: Record<string, StationIconDef> | null = null

function getStationIconsMap(): Record<string, StationIconDef> {
  if (cachedIcons === null) {
    cachedIcons = parseLoadedIcons(stationIconsData)
  }
  return cachedIcons
}

/** @deprecated Nutze getStationIconDef() */
export const STATION_ICON_BY_SLUG: Record<HubSlug, StationIconDef> =
  getStationIconsMap() as Record<HubSlug, StationIconDef>

export type StationBadgeStyleInput = {
  visited: boolean
  locked?: boolean
  accent: string
}

export type StationBadgeStyle = {
  iconColor: string
  muted: boolean
  locked: boolean
}

export function getStationIconDef(slug: string): StationIconDef {
  const def = getStationIconsMap()[slug]
  if (!def) {
    throw new Error(`station-icons: kein Icon für slug "${slug}"`)
  }
  return def
}

export function getStationBadgeStyle(
  input: StationBadgeStyleInput,
): StationBadgeStyle {
  const locked = input.locked ?? false
  const muted = !input.visited
  const iconColor = muted ? GS39_BRAND_HEX.navy300 : input.accent
  return { iconColor, muted, locked }
}

export function resetStationIconsCacheForTests(): void {
  cachedIcons = null
}
