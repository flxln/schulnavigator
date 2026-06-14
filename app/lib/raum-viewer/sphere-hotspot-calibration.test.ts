import { describe, expect, it } from 'vitest'
import {
  sphereCalibFromClick,
  SPHERE_CALIB_REFERENCE_CENTER,
} from '@/lib/raum-viewer/sphere-hotspot-calibration'

describe('sphere-hotspot-calibration', () => {
  it('wandelt Klick-Radianten in Grad-Snippet um', () => {
    const snippet = sphereCalibFromClick({
      yaw: 0.17453292519943295,
      pitch: -0.4363323135688589,
      textureX: 2800,
      textureY: 1200,
    })
    expect(snippet.yawDeg).toBe(10)
    expect(snippet.pitchDeg).toBe(-25)
    expect(snippet.textureX).toBe(2800)
    expect(snippet.json).toContain('"yaw": 10')
    expect(snippet.json).toContain('"pitch": -25')
  })

  it('fügt Hotspot-ID in Snippet ein', () => {
    const snippet = sphereCalibFromClick(
      { yaw: 0, pitch: 0 },
      'hs-frieda',
    )
    expect(snippet.json).toContain('"id": "hs-frieda"')
  })

  it('Referenzmitte ist yaw/pitch 0', () => {
    expect(SPHERE_CALIB_REFERENCE_CENTER.yawDeg).toBe(0)
    expect(SPHERE_CALIB_REFERENCE_CENTER.pitchDeg).toBe(0)
  })

  it('normalisiert PSV-yaw > 180° auf −180…180 für stations.json', () => {
    const yawRad = (323.5 * Math.PI) / 180
    const snippet = sphereCalibFromClick(
      { yaw: yawRad, pitch: -0.4607670455558127 },
      'hs-otto',
    )
    expect(snippet.yawDeg).toBe(-36.5)
    expect(snippet.json).toContain('"yaw": -36.5')
    expect(snippet.yawDeg).toBeGreaterThanOrEqual(-180)
    expect(snippet.yawDeg).toBeLessThanOrEqual(180)
  })
})
