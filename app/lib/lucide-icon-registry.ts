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
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

export const LUCIDE_ICON_REGISTRY = {
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
  Trees,
  UtensilsCrossed,
} as const satisfies Record<string, LucideIcon>

export type LucideIconName = keyof typeof LUCIDE_ICON_REGISTRY

export const LUCIDE_ICON_NAMES = Object.keys(LUCIDE_ICON_REGISTRY) as LucideIconName[]

export function isLucideIconName(name: string): name is LucideIconName {
  return name in LUCIDE_ICON_REGISTRY
}

export function resolveLucideIcon(name: string): LucideIcon | null {
  if (!isLucideIconName(name)) {
    return null
  }
  return LUCIDE_ICON_REGISTRY[name]
}
