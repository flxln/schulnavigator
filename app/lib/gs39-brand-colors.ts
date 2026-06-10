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

/** Akzentfarben pro Station (Hub schoolhouse-hub-map, ADR-016) */
export const GS39_STATION_ACCENT_HEX: Record<string, string> = {
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
}
