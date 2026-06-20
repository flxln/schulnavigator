import { describe, expect, it } from 'vitest'
import {
  normalizedViewportCenter,
  panPxFromStartPanX,
} from '@/lib/raum-viewer/viewport-center'

describe('panPxFromStartPanX', () => {
  const containerW = 400
  const effectiveDisplayW = 2000
  const maxPan = effectiveDisplayW - containerW

  it('roundtrip mit normalizedViewportCenter für realisierbaren Wert', () => {
    const startPanX = 0.5
    const panPx = panPxFromStartPanX(
      startPanX,
      containerW,
      effectiveDisplayW,
      maxPan,
    )
    const { x } = normalizedViewportCenter(panPx, containerW, effectiveDisplayW)
    expect(x).toBeCloseTo(startPanX, 5)
  })

  it('clamped startPanX 0 → panPx 0', () => {
    expect(
      panPxFromStartPanX(0, containerW, effectiveDisplayW, maxPan),
    ).toBe(0)
  })

  it('clamped startPanX 1 → panPx -maxPan', () => {
    expect(
      panPxFromStartPanX(1, containerW, effectiveDisplayW, maxPan),
    ).toBe(-maxPan)
  })

  it('gibt 0 zurück wenn maxPan 0', () => {
    expect(panPxFromStartPanX(0.5, containerW, effectiveDisplayW, 0)).toBe(0)
  })
})
