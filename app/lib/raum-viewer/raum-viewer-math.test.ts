import { describe, expect, it } from 'vitest'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import { gammaToTargetPan, lerpPan } from '@/lib/raum-viewer/pan-from-gamma'
import {
  MIN_PAN_DISPLAY_RATIO,
  RECOMMENDED_SOURCE_ASPECT_MIN,
  clampPan,
  imageDisplayWidth,
  maxPanPx,
} from '@/lib/raum-viewer/constants'
import type { Hotspot } from '@/lib/types'

describe('clampPan', () => {
  it('hält Pan im negativen Bereich', () => {
    expect(clampPan(0, 100)).toBe(0)
    expect(clampPan(-50, 100)).toBe(-50)
    expect(clampPan(-150, 100)).toBe(-100)
    expect(clampPan(20, 100)).toBe(0)
  })
})

describe('imageDisplayWidth / maxPanPx', () => {
  it('berechnet Breite und max Pan', () => {
    const dw = imageDisplayWidth(1800, 1200, 280)
    expect(dw).toBe(420)
    expect(maxPanPx(dw, 360)).toBe(60)
  })

  it('Panorama (2.5:1) erfüllt MIN_PAN_DISPLAY_RATIO auf typischem Phone-Viewport', () => {
    const containerW = 390
    const containerH = 360
    const dw = imageDisplayWidth(2500, 1000, containerH)
    expect(dw / containerW).toBeGreaterThanOrEqual(MIN_PAN_DISPLAY_RATIO)
    expect(2500 / 1000).toBeGreaterThanOrEqual(RECOMMENDED_SOURCE_ASPECT_MIN)
    expect(maxPanPx(dw, containerW)).toBeGreaterThan(0)
  })

  it('4:3 unterschreitet MIN_PAN_DISPLAY_RATIO auf typischem Phone-Viewport', () => {
    const containerW = 390
    const containerH = 360
    const dw = imageDisplayWidth(1920, 1440, containerH)
    expect(dw / containerW).toBeLessThan(MIN_PAN_DISPLAY_RATIO)
  })
})

describe('normalizedViewportCenter', () => {
  it('Mitte bei pan 0', () => {
    const c = normalizedViewportCenter(0, 360, 420)
    expect(c.x).toBeCloseTo(360 / 2 / 420, 5)
    expect(c.y).toBe(0.5)
  })
})

describe('hitTestHotspot', () => {
  const hs: Hotspot[] = [
    { id: 'a', x: 0.5, y: 0.5, radius: 0.1, mediumId: 'm1' },
    { id: 'b', x: 0.9, y: 0.5, radius: 0.05, mediumId: 'm2' },
  ]

  it('findet nächsten Hotspot im Radius', () => {
    expect(hitTestHotspot({ x: 0.52, y: 0.5 }, hs)?.id).toBe('a')
  })

  it('gibt null zurück außerhalb', () => {
    expect(hitTestHotspot({ x: 0.05, y: 0.05 }, hs)).toBeNull()
  })
})

describe('gammaToTargetPan', () => {
  it('liefert 0 ohne Pan-Spielraum', () => {
    expect(gammaToTargetPan(30, 0, 0)).toBe(0)
  })

  it('bewegt Pan mit Gamma-Delta', () => {
    const p = gammaToTargetPan(20, 200, 0)
    expect(p).toBeLessThan(0)
    expect(p).toBeGreaterThanOrEqual(-200)
  })
})

describe('lerpPan', () => {
  it('interpoliert', () => {
    expect(lerpPan(0, 10, 0.5)).toBe(5)
  })
})
