import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUBBLE_PITCH_OFFSET_DEG,
  normalizeYawDeg,
  radiansToDegrees,
  resolveBubbleProjectionPitchDeg,
  resolveImageLayerSize,
  resolveSphereStartView,
  roundDeg,
} from '@/lib/raum-viewer/sphere-marker-conventions'
import type { Hotspot360 } from '@/lib/types'

describe('sphere-marker-conventions', () => {
  it('radiansToDegrees rundet auf eine Dezimalstelle', () => {
    expect(roundDeg(1.234)).toBe(1.2)
    expect(radiansToDegrees(0, 0)).toEqual({ yawDeg: 0, pitchDeg: 0 })
  })

  it('resolveImageLayerSize liefert getrennte Maße für Icon und Maskottchen', () => {
    const iconHs: Hotspot360 = {
      id: 'i',
      yaw: 0,
      pitch: 0,
      mediumId: 'm',
      iconSize: 0.1,
    }
    const mascotHs: Hotspot360 = {
      id: 'm',
      yaw: 0,
      pitch: 0,
      action: 'dialog',
      mascot: 'frieda',
      mascotSize: 0.5,
    }
    const icon = resolveImageLayerSize(iconHs, 'icon', 400)
    const masc = resolveImageLayerSize(mascotHs, 'mascot', 400)
    expect(icon.height).toBeGreaterThan(0)
    expect(masc.height).toBeGreaterThan(icon.height)
    expect(masc.width).toBeLessThan(masc.height)
  })

  it('resolveBubbleProjectionPitchDeg addiert Default-Offset', () => {
    const hs: Hotspot360 = {
      id: 'f',
      yaw: 0,
      pitch: -20,
      action: 'dialog',
      mascot: 'frieda',
    }
    expect(resolveBubbleProjectionPitchDeg(hs)).toBe(
      -20 + DEFAULT_BUBBLE_PITCH_OFFSET_DEG,
    )
  })

  it('resolveSphereStartView nutzt Default 0/0', () => {
    expect(resolveSphereStartView()).toEqual({ yawDeg: 0, pitchDeg: 0 })
  })

  it('resolveSphereStartView normalisiert yaw', () => {
    expect(resolveSphereStartView(200, -5)).toEqual({ yawDeg: -160, pitchDeg: -5 })
  })

  it('resolveSphereStartView clampt pitch', () => {
    expect(resolveSphereStartView(undefined, 120)).toEqual({ yawDeg: 0, pitchDeg: 90 })
    expect(resolveSphereStartView(30)).toEqual({ yawDeg: 30, pitchDeg: 0 })
  })

  it('normalizeYawDeg mappt 200 auf −160', () => {
    expect(normalizeYawDeg(200)).toBe(-160)
  })
})
