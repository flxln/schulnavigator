import { clamp } from '@/lib/raum-viewer/constants'
import type { DialogBubbleLayout } from '@/lib/types'

export const DEFAULT_BUBBLE_Y = 0.12
export const DEFAULT_BUBBLE_MAX_WIDTH = 0.88
/** ~15px bei 400px Box-Höhe (text-[15px]). */
export const DEFAULT_BUBBLE_FONT_SIZE = 0.0375
export const DEFAULT_BUBBLE_FOLLOW_PAN = true

export const MIN_BUBBLE_Y = 0
export const MAX_BUBBLE_Y = 1
export const MIN_BUBBLE_X = 0
export const MAX_BUBBLE_X = 1
export const MIN_BUBBLE_MAX_WIDTH = 0.3
export const MAX_BUBBLE_MAX_WIDTH = 1
export const MIN_BUBBLE_FONT_SIZE = 0.02
export const MAX_BUBBLE_FONT_SIZE = 0.06

/** Horizontale Verschiebung der Blase, geclampt auf ±35 % containerW (ADR-013). */
export const BUBBLE_OFFSET_CLAMP_RATIO = 0.35

export type BubbleLayoutPx = {
  topPx: number
  maxWidthPx: number
  fontSizePx: number
  baseOffsetX: number
  followPan: boolean
}

export function clampBubbleOffsetX(offsetX: number, containerW: number): number {
  const limit = containerW * BUBBLE_OFFSET_CLAMP_RATIO
  return clamp(offsetX, -limit, limit)
}

export function resolveBubbleLayoutPx(
  bubble: DialogBubbleLayout,
  containerW: number,
  containerH: number,
): BubbleLayoutPx | null {
  if (containerW <= 0 || containerH <= 0) {
    return null
  }

  const y = clamp(bubble.y ?? DEFAULT_BUBBLE_Y, MIN_BUBBLE_Y, MAX_BUBBLE_Y)
  const maxWidthNorm = clamp(
    bubble.maxWidth ?? DEFAULT_BUBBLE_MAX_WIDTH,
    MIN_BUBBLE_MAX_WIDTH,
    MAX_BUBBLE_MAX_WIDTH,
  )
  const fontSizeNorm = clamp(
    bubble.fontSize ?? DEFAULT_BUBBLE_FONT_SIZE,
    MIN_BUBBLE_FONT_SIZE,
    MAX_BUBBLE_FONT_SIZE,
  )
  const followPan = bubble.followPan ?? DEFAULT_BUBBLE_FOLLOW_PAN
  const baseOffsetX =
    bubble.x !== undefined
      ? (clamp(bubble.x, MIN_BUBBLE_X, MAX_BUBBLE_X) - 0.5) * containerW
      : 0

  return {
    topPx: y * containerH,
    maxWidthPx: maxWidthNorm * containerW,
    fontSizePx: fontSizeNorm * containerH,
    baseOffsetX,
    followPan,
  }
}
