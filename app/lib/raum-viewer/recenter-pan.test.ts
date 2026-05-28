import { describe, expect, it } from 'vitest'
import { centeredPanPx } from '@/lib/raum-viewer/pan-from-orientation'
import { panPxAfterRecenter } from '@/lib/raum-viewer/recenter-pan'

describe('panPxAfterRecenter', () => {
  it('uses centeredPanPx for alpha when maxPan > 0', () => {
    expect(panPxAfterRecenter(200, 'alpha')).toBe(centeredPanPx(200))
  })

  it('uses 0 for gamma when maxPan > 0', () => {
    expect(panPxAfterRecenter(200, 'gamma')).toBe(0)
  })

  it('returns 0 when maxPan is 0', () => {
    expect(panPxAfterRecenter(0, 'alpha')).toBe(0)
  })
})
