import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUBBLE_FONT_SIZE,
  DEFAULT_BUBBLE_FOLLOW_PAN,
  DEFAULT_BUBBLE_MAX_WIDTH,
  DEFAULT_BUBBLE_Y,
  clampBubbleOffsetX,
  resolveBubbleLayoutPx,
} from '@/lib/dialog-bubble-layout'

describe('resolveBubbleLayoutPx', () => {
  it('liefert null bei containerH <= 0', () => {
    expect(resolveBubbleLayoutPx({}, 375, 0)).toBeNull()
    expect(resolveBubbleLayoutPx({}, 375, -1)).toBeNull()
  })

  it('liefert null bei containerW <= 0', () => {
    expect(resolveBubbleLayoutPx({}, 0, 400)).toBeNull()
  })

  it('löst Defaults bei leerem bubble auf', () => {
    const layout = resolveBubbleLayoutPx({}, 400, 400)
    expect(layout).toEqual({
      topPx: DEFAULT_BUBBLE_Y * 400,
      maxWidthPx: DEFAULT_BUBBLE_MAX_WIDTH * 400,
      fontSizePx: DEFAULT_BUBBLE_FONT_SIZE * 400,
      baseOffsetX: 0,
      followPan: DEFAULT_BUBBLE_FOLLOW_PAN,
    })
  })

  it('fontSize-Default ergibt ~15px bei 400px Box', () => {
    const layout = resolveBubbleLayoutPx({}, 400, 400)
    expect(layout?.fontSizePx).toBeCloseTo(15, 1)
  })

  it('löst explizite Werte auf', () => {
    const layout = resolveBubbleLayoutPx(
      { y: 0.2, maxWidth: 0.5, fontSize: 0.04, followPan: false },
      400,
      400,
    )
    expect(layout).toEqual({
      topPx: 80,
      maxWidthPx: 200,
      fontSizePx: 16,
      baseOffsetX: 0,
      followPan: false,
    })
  })

  it('berechnet baseOffsetX aus x', () => {
    const layout = resolveBubbleLayoutPx({ x: 0.3 }, 400, 400)
    expect(layout?.baseOffsetX).toBeCloseTo(-80, 5)
    const layoutRight = resolveBubbleLayoutPx({ x: 0.7 }, 400, 400)
    expect(layoutRight?.baseOffsetX).toBeCloseTo(80, 5)
  })

  it('clampt y, maxWidth und fontSize', () => {
    const layout = resolveBubbleLayoutPx(
      { y: 2, maxWidth: 0.1, fontSize: 0.1 },
      400,
      400,
    )
    expect(layout?.topPx).toBe(400)
    expect(layout?.maxWidthPx).toBe(120)
    expect(layout?.fontSizePx).toBe(24)
  })
})

describe('clampBubbleOffsetX', () => {
  it('begrenzt auf ±35 % containerW', () => {
    expect(clampBubbleOffsetX(200, 400)).toBe(140)
    expect(clampBubbleOffsetX(-200, 400)).toBe(-140)
    expect(clampBubbleOffsetX(100, 400)).toBe(100)
  })
})
