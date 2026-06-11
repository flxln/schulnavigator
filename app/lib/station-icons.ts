import {
  BookOpen,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Home,
  Languages,
  Monitor,
  Music,
  Palette,
  PersonStanding,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import type { HubSlug } from '@/lib/schoolhouse-hub-map'

export type StationIconDef =
  | { type: 'lucide'; Icon: LucideIcon }
  | { type: 'image'; src: string; alt?: string }

export const STATION_ICON_BY_SLUG: Record<HubSlug, StationIconDef> = {
  klassenzimmer: { type: 'lucide', Icon: GraduationCap },
  musik: { type: 'lucide', Icon: Music },
  daz: { type: 'lucide', Icon: Languages },
  kunst: { type: 'lucide', Icon: Palette },
  'pc-raum': { type: 'lucide', Icon: Monitor },
  lesewelt: { type: 'lucide', Icon: BookOpen },
  werken: { type: 'lucide', Icon: Hammer },
  speiseraum: { type: 'lucide', Icon: UtensilsCrossed },
  hort: { type: 'lucide', Icon: Home },
  turnhalle: { type: 'lucide', Icon: PersonStanding },
  schulsozialarbeit: { type: 'lucide', Icon: HeartHandshake },
}

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
  const def = STATION_ICON_BY_SLUG[slug as HubSlug]
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
