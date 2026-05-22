import { describe, expect, it } from 'vitest'
import { visibleYNormalRange } from '@/lib/raum-viewer/clip-zone'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import {
  angleDeltaDeg,
  circularEmaDeg,
  circularMeanDeg,
  lerpPan,
  neutralAngleForPan,
  orientationToTargetPan,
  resolvePanAxis,
} from '@/lib/raum-viewer/pan-from-orientation'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import {
  GYRO_DEADZONE_DEG,
  GYRO_FULL_RANGE_DEG,
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

describe('angleDeltaDeg', () => {
  it('wrappt über 360/0', () => {
    expect(angleDeltaDeg(10, 350)).toBe(20)
    expect(angleDeltaDeg(350, 10)).toBe(-20)
  })
})

describe('circularMeanDeg', () => {
  it('mittelt über 0/360', () => {
    const m = circularMeanDeg([359, 1, 3])
    expect(m).toBeCloseTo(1, 0)
  })
})

describe('circularEmaDeg', () => {
  it('springt nicht wild über 360/0', () => {
    const s = circularEmaDeg(359, 1, 0.38)
    expect(angleDeltaDeg(s, 0)).toBeLessThan(10)
  })
})

describe('orientationToTargetPan', () => {
  it('liefert 0 ohne Pan-Spielraum', () => {
    expect(orientationToTargetPan(30, 0, 0, 'oneSided', false)).toBe(0)
  })

  it('oneSided: bewegt Pan mit Winkel-Delta', () => {
    const p = orientationToTargetPan(20, 200, 0, 'oneSided', false)
    expect(p).toBeLessThan(0)
    expect(p).toBeGreaterThanOrEqual(-200)
  })

  it('centered: Neutral in der Mitte', () => {
    const maxPan = 200
    const p = orientationToTargetPan(0, maxPan, 0, 'centered', true)
    expect(p).toBeCloseTo(-maxPan / 2, 1)
  })

  it('centered: +FULL_RANGE → rechter Rand (pan 0)', () => {
    const maxPan = 200
    const p = orientationToTargetPan(
      GYRO_FULL_RANGE_DEG + GYRO_DEADZONE_DEG,
      maxPan,
      0,
      'centered',
      true,
    )
    expect(p).toBeCloseTo(0, 1)
  })

  it('centered: −FULL_RANGE → linker Rand', () => {
    const maxPan = 200
    const p = orientationToTargetPan(
      -(GYRO_FULL_RANGE_DEG + GYRO_DEADZONE_DEG),
      maxPan,
      0,
      'centered',
      true,
    )
    expect(p).toBeCloseTo(-maxPan, 1)
  })
})

describe('neutralAngleForPan', () => {
  it('oneSided: Round-Trip', () => {
    const maxPan = 200
    const angleDeg = 12
    const pan = orientationToTargetPan(angleDeg, maxPan, 0, 'oneSided', false)
    const ref = neutralAngleForPan(angleDeg, pan, maxPan, 'oneSided', false)
    const pan2 = orientationToTargetPan(angleDeg, maxPan, ref, 'oneSided', false)
    expect(pan2).toBeCloseTo(pan, 0)
  })

  it('centered: Round-Trip inkl. Mitte', () => {
    const maxPan = 200
    const angleDeg = 90
    const pan = -maxPan / 2
    const ref = neutralAngleForPan(angleDeg, pan, maxPan, 'centered', true)
    const pan2 = orientationToTargetPan(
      angleDeg,
      maxPan,
      ref,
      'centered',
      true,
    )
    expect(pan2).toBeCloseTo(pan, 0)
  })
})

describe('resolvePanAxis', () => {
  it('liefert einen gültigen Achsenwert', () => {
    const axis = resolvePanAxis()
    expect(axis === 'alpha' || axis === 'gamma').toBe(true)
  })
})

describe('lerpPan', () => {
  it('interpoliert', () => {
    expect(lerpPan(0, 10, 0.5)).toBe(5)
  })
})
