import { describe, expect, it } from 'vitest'
import { visibleYNormalRange } from '@/lib/raum-viewer/clip-zone'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import {
  gammaToTargetPan,
  lerpPan,
  neutralGammaForPan,
} from '@/lib/raum-viewer/pan-from-gamma'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
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
    const { effectiveDisplayW } = roomPanZoom(
      2500,
      1000,
      containerW,
      containerH,
      MIN_PAN_DISPLAY_RATIO,
    )
    expect(effectiveDisplayW / containerW).toBeGreaterThanOrEqual(
      MIN_PAN_DISPLAY_RATIO,
    )
    expect(2500 / 1000).toBeGreaterThanOrEqual(RECOMMENDED_SOURCE_ASPECT_MIN)
    expect(maxPanPx(effectiveDisplayW, containerW)).toBeGreaterThan(0)
  })

  it('4:3 erreicht MIN_PAN_DISPLAY_RATIO nach Auto-Zoom', () => {
    const containerW = 390
    const containerH = 360
    const { zoom, effectiveDisplayW } = roomPanZoom(
      1920,
      1440,
      containerW,
      containerH,
      MIN_PAN_DISPLAY_RATIO,
    )
    expect(zoom).toBeGreaterThan(1)
    expect(effectiveDisplayW / containerW).toBeGreaterThanOrEqual(
      MIN_PAN_DISPLAY_RATIO - 0.001,
    )
  })
})

describe('visibleYNormalRange', () => {
  it('liefert volle Höhe ohne Zoom', () => {
    const r = visibleYNormalRange(2.6, 390, 360, MIN_PAN_DISPLAY_RATIO)
    expect(r.yMin).toBe(0)
    expect(r.yMax).toBe(1)
  })

  it('liefert eingeschränkten Y-Bereich bei 4:3 und Auto-Zoom', () => {
    const aspect = 1920 / 1440
    const r = visibleYNormalRange(aspect, 390, 360, MIN_PAN_DISPLAY_RATIO)
    expect(r.yMin).toBeGreaterThan(0)
    expect(r.yMax).toBeLessThan(1)
    expect(r.yMax - r.yMin).toBeLessThan(1)
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

describe('neutralGammaForPan', () => {
  it('rundet Pan nach Re-Kalibrierung annähernd zurück', () => {
    const maxPan = 200
    const gammaDeg = 12
    const pan = gammaToTargetPan(gammaDeg, maxPan, 0)
    const ref = neutralGammaForPan(gammaDeg, pan, maxPan)
    const pan2 = gammaToTargetPan(gammaDeg, maxPan, ref)
    expect(pan2).toBeCloseTo(pan, 0)
  })
})

describe('lerpPan', () => {
  it('interpoliert', () => {
    expect(lerpPan(0, 10, 0.5)).toBe(5)
  })
})
