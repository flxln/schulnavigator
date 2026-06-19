/**
 * Slot-frame-Koordinaten gültig nur für viewBox-Revision `0 0 1086.5 1453.9`
 * (siehe `scripts/prepare-hub-outline.mjs`). Bei Asset-Re-Export Frames neu vermessen.
 */

export type HubSlotKind = 'fenster' | 'portal' | 'deko' | 'wegweiser'
export type HubFrame = readonly [x: number, y: number, w: number, h: number]
export type HubPoint = readonly [x: number, y: number]

export type HubSlotDef = {
  frame: HubFrame
  kind: HubSlotKind
  hitFrame?: HubFrame
  chipAnchor?: HubPoint
  rotation?: number
  overlayFrame?: HubFrame
  overlayTranslate?: HubPoint
}

export const HUB_VIEWBOX = { w: 1086.5, h: 1453.9 } as const

export const HUB_SLOTS: Record<string, HubSlotDef> = {
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
  'fenster-lr': { kind: 'deko', frame: [741.6, 565.08, 54.47, 144.09] },
  'wegweiser-oben': {
    kind: 'wegweiser',
    frame: [278.53, 1010.53, 142.1, 79.66],
    hitFrame: [299.84, 1022.48, 99.47, 55.76],
    chipAnchor: [349.58, 1050.36],
    rotation: -9.85,
    overlayFrame: [267.63, 993.54, 134.24, 57.54],
    overlayTranslate: [-170.01, 72.37],
  },
  'wegweiser-unten': {
    kind: 'wegweiser',
    frame: [250.83, 1080.3, 138.71, 68.93],
    hitFrame: [271.64, 1090.64, 97.1, 48.25],
    chipAnchor: [320.19, 1114.77],
    rotation: 4.96,
    overlayFrame: [251.45, 1077.53, 134.24, 57.54],
    overlayTranslate: [96.8, -23.39],
  },
  'deko-dach': { kind: 'deko', frame: [218.62, 207.78, 654.08, 71.27] },
  'deko-vestibuel': { kind: 'deko', frame: [433.13, 765.98, 223.18, 118.52] },
  'deko-fluegel-l': { kind: 'deko', frame: [12.25, 341.17, 55.88, 118.08] },
  'deko-fluegel-r': { kind: 'deko', frame: [1019.88, 339.77, 59.95, 124.98] },
}

export function listAssignableSlotIds(): string[] {
  return Object.entries(HUB_SLOTS)
    .filter(([, slot]) => slot.kind !== 'deko')
    .map(([id]) => id)
}
