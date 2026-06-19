import stationAccentsData from '../data/station-accents.json'
import {
  validateStationAccentsContent,
  type StationAccentsFile,
} from '@/lib/mpz-hub-config-validation'

/**
 * GS39 Markenfarben als Hex-Literale für SVG/Canvas (kein color-mix in SVG-Attributen).
 * Spiegelt :root in gs39-tokens.css — bei Token-Änderung hier mitpflegen.
 */

export const GS39_BRAND_HEX = {
  navy: '#082a50',
  navy700: '#0b3565',
  navy300: '#6b89b4',
  green: '#4b9a23',
  green700: '#3d7e1b',
  green300: '#a6d08a',
  red: '#ef3a37',
  sun: '#fbbb24',
  blue: '#1f6abb',
  sky: '#9edafe',
  sky50: '#e4f3fc',
  paper: '#fcfbf7',
  paper50: '#f5f2ea',
  white: '#ffffff',
} as const

export type Gs39BrandHexKey = keyof typeof GS39_BRAND_HEX

export const FALLBACK_STATION_ACCENTS: Record<string, string> = {
  klassenzimmer: GS39_BRAND_HEX.blue,
  daz: GS39_BRAND_HEX.blue,
  'pc-raum': GS39_BRAND_HEX.navy,
  werken: GS39_BRAND_HEX.sun,
  turnhalle: GS39_BRAND_HEX.red,
  speiseraum: GS39_BRAND_HEX.sun,
  kunst: GS39_BRAND_HEX.sun,
  lesewelt: GS39_BRAND_HEX.green,
  hort: GS39_BRAND_HEX.red,
  musik: GS39_BRAND_HEX.red,
  schulsozialarbeit: GS39_BRAND_HEX.green,
  schulhof: GS39_BRAND_HEX.green,
}

function parseLoadedAccents(raw: unknown): Record<string, string> {
  const errors = validateStationAccentsContent(raw)
  if (errors.length > 0) {
    return { ...FALLBACK_STATION_ACCENTS }
  }
  const file = raw as StationAccentsFile
  const normalized: Record<string, string> = {}
  for (const [slug, hex] of Object.entries(file.accents)) {
    normalized[slug] = hex.trim().toLowerCase()
  }
  return normalized
}

let cachedAccents: Record<string, string> | null = null

export function getStationAccentsMap(): Record<string, string> {
  if (cachedAccents === null) {
    cachedAccents = parseLoadedAccents(stationAccentsData)
  }
  return cachedAccents
}

export function getStationAccentHex(slug: string): string {
  const hex = getStationAccentsMap()[slug]
  if (!hex) {
    throw new Error(`gs39-brand-colors: kein Akzent für slug "${slug}"`)
  }
  return hex
}

/** @deprecated Nutze getStationAccentsMap() */
export const GS39_STATION_ACCENT_HEX: Record<string, string> = getStationAccentsMap()

export function resetStationAccentsCacheForTests(): void {
  cachedAccents = null
}
