import { describe, expect, it } from 'vitest'
import {
  flatCalibFromImageClick,
  hotspotYBandForCalib,
  objectFitContainImageRect,
} from '@/lib/flat-hotspot-calib'

describe('flat-hotspot-calib', () => {
  it('objectFitContainImageRect zentriert breites Bild', () => {
    const rect = objectFitContainImageRect(400, 300, 2400, 800)
    expect(rect).not.toBeNull()
    expect(rect!.width).toBe(400)
    expect(rect!.height).toBeCloseTo(400 / 3, 5)
    expect(rect!.left).toBe(0)
    expect(rect!.top).toBeGreaterThan(0)
  })

  it('flatCalibFromImageClick liefert x/y auf Bildmitte', () => {
    const imageRect = { left: 0, top: 50, width: 400, height: 200 }
    const yBand = { yMin: 0, yMax: 1 }
    const coords = flatCalibFromImageClick({
      clientX: 200,
      clientY: 150,
      imageRect,
      yBand,
    })
    expect(coords).toEqual({ x: 0.5, y: 0.5 })
  })

  it('flatCalibFromImageClick mappt y über yBand', () => {
    const imageRect = { left: 0, top: 0, width: 100, height: 100 }
    const yBand = { yMin: 0.25, yMax: 0.75 }
    const coords = flatCalibFromImageClick({
      clientX: 50,
      clientY: 50,
      imageRect,
      yBand,
    })
    expect(coords?.y).toBe(0.5)
  })

  it('flatCalibFromImageClick außerhalb des Bildes → null', () => {
    const imageRect = { left: 10, top: 10, width: 100, height: 100 }
    const coords = flatCalibFromImageClick({
      clientX: 5,
      clientY: 50,
      imageRect,
      yBand: { yMin: 0, yMax: 1 },
    })
    expect(coords).toBeNull()
  })

  it('hotspotYBandForCalib nutzt MIN_PAN_DISPLAY_RATIO', () => {
    const band = hotspotYBandForCalib(1200, 1000, 390, 500)
    expect(band.yMin).toBeGreaterThan(0)
    expect(band.yMax).toBeLessThan(1)
  })
})
