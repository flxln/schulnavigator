/** Card-Peek-Hero: `calc(100svh - 6.5rem)` — 6.5rem ≈ 104 px bei 16 px root. */
export const CARD_PEEK_OFFSET_PX = 104

export function cardPeekHeroHeight(viewportH: number): number {
  return Math.max(0, viewportH - CARD_PEEK_OFFSET_PX)
}

/** Typische Viewports für Tablet-/Phone-Regressionstests (Epic #74). */
export const VIEWPORT_PRESETS = {
  phone: { w: 375, h: 667, contentW: 375 },
  tabletPortrait: { w: 768, h: 1024, contentW: 672 },
  ipadProPortrait: { w: 1024, h: 1366, contentW: 768 },
} as const

export function cardPeekContainer(
  preset: keyof typeof VIEWPORT_PRESETS,
): { containerW: number; containerH: number } {
  const { h, contentW } = VIEWPORT_PRESETS[preset]
  return { containerW: contentW, containerH: cardPeekHeroHeight(h) }
}
