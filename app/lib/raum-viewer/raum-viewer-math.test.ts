import { describe, expect, it } from 'vitest'
import {
  hotspotImageY,
  viewportYFromImageY,
  visibleYNormalRange,
} from '@/lib/raum-viewer/clip-zone'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import {
  angleDeltaDeg,
  circularEmaDeg,
  circularMeanDeg,
  headingFromOrientation,
  isGimbalLock,
  lerpPan,
  neutralAngleForPan,
  orientationToTargetPan,
  resolvePanAxis,
} from '@/lib/raum-viewer/pan-from-orientation'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import {
  GIMBAL_LOCK_ENTER_DEG,
  GIMBAL_LOCK_EXIT_DEG,
  GYRO_DEADZONE_DEG,
  GYRO_FULL_RANGE_DEG,
  GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG,
  GYRO_GAMMA_PAN_SIGN,
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

describe('hotspotImageY / viewportYFromImageY', () => {
  const band = { yMin: 0.269, yMax: 0.731 }

  it('mappt viewport 0/1 auf sichtbare Ränder', () => {
    expect(hotspotImageY(0, band)).toBeCloseTo(0.269, 5)
    expect(hotspotImageY(1, band)).toBeCloseTo(0.731, 5)
  })

  it('roundtrip', () => {
    expect(viewportYFromImageY(hotspotImageY(0.78, band), band)).toBeCloseTo(
      0.78,
      5,
    )
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

describe('kontinuierlicher Heading (kein 180°-Sprung)', () => {
  it('entfaltetes Heading: Frame-Deltas summieren sich über 0/360 stetig', () => {
    const raw = [350, 355, 0, 5, 10]
    let unwrapped = raw[0]
    for (let i = 1; i < raw.length; i++) {
      unwrapped += angleDeltaDeg(raw[i], raw[i - 1])
    }
    expect(unwrapped).toBeCloseTo(370, 5)
  })

  it('centered, linearer Delta: Weiterdrehen über 180° bleibt am selben Rand (kein Kippen)', () => {
    const maxPan = 200
    const neutral = 0
    const edge = GYRO_FULL_RANGE_DEG + GYRO_DEADZONE_DEG
    // Kontinuierlicher Sweep nach rechts, über die Vollausschlag-Grenze hinaus.
    const right = orientationToTargetPan(edge, maxPan, neutral, 'centered', false)
    const right170 = orientationToTargetPan(170, maxPan, neutral, 'centered', false)
    const right190 = orientationToTargetPan(190, maxPan, neutral, 'centered', false)
    expect(right).toBeCloseTo(0, 1)
    expect(right170).toBeCloseTo(0, 1)
    // Mit gefaltetem Delta würde 190° hier auf den linken Rand springen.
    expect(right190).toBeCloseTo(0, 1)

    const left190 = orientationToTargetPan(-190, maxPan, neutral, 'centered', false)
    expect(left190).toBeCloseTo(-maxPan, 1)
  })

  it('gefaltetes Delta (alt) kippt bei 190° tatsächlich auf den Gegenrand', () => {
    const maxPan = 200
    const folded = orientationToTargetPan(190, maxPan, 0, 'centered', true)
    expect(folded).toBeCloseTo(-maxPan, 1)
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

describe('headingFromOrientation', () => {
  const norm = (d: number) => ((d % 360) + 360) % 360

  it('reduziert sich bei senkrechtem Handy (β=90, γ=0) auf α', () => {
    for (const alpha of [0, 45, 90, 180, 270, 359]) {
      const h = headingFromOrientation(alpha, 90, 0)
      expect(h).not.toBeNull()
      expect(norm(h as number)).toBeCloseTo(norm(alpha), 4)
    }
  })

  it('bleibt durch β=90° hinweg stetig (kein Sprung in der Singularität)', () => {
    const alpha = 120
    const below = headingFromOrientation(alpha, 85, 0) as number
    const at = headingFromOrientation(alpha, 90, 0) as number
    const above = headingFromOrientation(alpha, 95, 0) as number
    expect(Math.abs(angleDeltaDeg(at, below))).toBeLessThan(2)
    expect(Math.abs(angleDeltaDeg(above, at))).toBeLessThan(2)
  })

  it('kürzt Euler-Zittern (α↔γ-Kopplung) bei β=90° exakt heraus', () => {
    // Bei β=90° fallen α- und γ-Achse zusammen → dieselbe Lage; das Sensor-
    // Zittern verteilt sich auf α/γ, die Richtung bleibt identisch.
    const clean = headingFromOrientation(120, 90, 0) as number
    const jittered = headingFromOrientation(120 + 8, 90, -8) as number
    expect(Math.abs(angleDeltaDeg(jittered, clean))).toBeLessThan(0.001)
  })

  it('liefert null, wenn die Rückseite senkrecht zeigt (Handy flach, β≈0)', () => {
    expect(headingFromOrientation(0, 0, 0)).toBeNull()
  })
})

describe('isGimbalLock', () => {
  it('betritt Zone bei β nahe 90°', () => {
    expect(isGimbalLock(90, false)).toBe(true)
    expect(isGimbalLock(90 - GIMBAL_LOCK_ENTER_DEG + 1, false)).toBe(true)
  })

  it('verlässt Zone erst oberhalb EXIT', () => {
    expect(isGimbalLock(90 - GIMBAL_LOCK_EXIT_DEG - 1, true)).toBe(false)
  })

  it('hält Zustand in der Hysterese-Lücke', () => {
    const between = (GIMBAL_LOCK_ENTER_DEG + GIMBAL_LOCK_EXIT_DEG) / 2
    expect(isGimbalLock(90 - between, true)).toBe(true)
    expect(isGimbalLock(90 - between, false)).toBe(false)
  })
})

describe('γ-Fallback opts', () => {
  it('Default unverändert ohne opts', () => {
    const maxPan = 200
    const withDefault = orientationToTargetPan(20, maxPan, 0, 'centered', false)
    const explicit = orientationToTargetPan(20, maxPan, 0, 'centered', false, {
      sign: 1,
      fullRangeDeg: GYRO_FULL_RANGE_DEG,
    })
    expect(explicit).toBeCloseTo(withDefault, 5)
  })

  it('γ-Override invertiert Richtung (sign=-1)', () => {
    const maxPan = 200
    const alphaPan = orientationToTargetPan(30, maxPan, 0, 'centered', false)
    const gammaPan = orientationToTargetPan(30, maxPan, 0, 'centered', false, {
      sign: GYRO_GAMMA_PAN_SIGN,
      fullRangeDeg: GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG,
    })
    // GYRO_GAMMA_PAN_SIGN=-1 mit gleichem fullRangeDeg → spiegelverkehrt zur Mitte
    expect(gammaPan).toBeCloseTo(-maxPan - alphaPan, 5)
    expect(alphaPan).toBeGreaterThan(-maxPan / 2)
    expect(gammaPan).toBeLessThan(-maxPan / 2)
  })

  it('Moduswechsel: Re-Anchor hält panPx stetig', () => {
    const maxPan = 200
    const alphaRaw = 25
    const gammaRaw = -12
    const gammaOpts = {
      sign: GYRO_GAMMA_PAN_SIGN,
      fullRangeDeg: GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG,
    }
    const panPx = orientationToTargetPan(
      alphaRaw,
      maxPan,
      0,
      'centered',
      false,
    )

    const reAnchoredGamma = neutralAngleForPan(
      gammaRaw,
      panPx,
      maxPan,
      'centered',
      false,
      gammaOpts,
    )
    const panAfterSwitch = orientationToTargetPan(
      gammaRaw,
      maxPan,
      reAnchoredGamma,
      'centered',
      false,
      gammaOpts,
    )
    expect(panAfterSwitch).toBeCloseTo(panPx, 0)
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
