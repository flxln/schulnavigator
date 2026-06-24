import { describe, expect, it } from 'vitest'
import { visibleYNormalRange } from '@/lib/raum-viewer/clip-zone'
import {
  cardPeekContainer,
  cardPeekHeroHeight,
} from '@/lib/raum-viewer/container-geometry'
import { MIN_PAN_DISPLAY_RATIO } from '@/lib/raum-viewer/constants'
import { getAllStations } from '@/lib/stations'
import type { Hotspot, Station } from '@/lib/types'

const ASPECT_4_3 = 4 / 3
const ASPECT_16_9 = 16 / 9

function isFlatViewer(station: Station): boolean {
  return station.viewer !== 'equirectangular'
}

function flatStationsWithHotspots(): Station[] {
  return getAllStations().filter(
    (s) => isFlatViewer(s) && (s.hotspots?.length ?? 0) > 0,
  )
}

function cropFraction(
  aspect: number,
  containerW: number,
  containerH: number,
): number {
  const { yMin, yMax } = visibleYNormalRange(
    aspect,
    containerW,
    containerH,
    MIN_PAN_DISPLAY_RATIO,
  )
  return 1 - (yMax - yMin)
}

describe('cardPeekHeroHeight', () => {
  it('zieht 6.5rem vom Viewport ab', () => {
    expect(cardPeekHeroHeight(667)).toBe(563)
    expect(cardPeekHeroHeight(1024)).toBe(920)
  })
})

describe('visibleYNormalRange — Tablet Card-Peek (kein Hero-Cap)', () => {
  it('4:3 auf Tablet-Portrait: Crop ≤ 10 % (uncapped-Entscheidung)', () => {
    const { containerW, containerH } = cardPeekContainer('tabletPortrait')
    expect(cropFraction(ASPECT_4_3, containerW, containerH)).toBeLessThanOrEqual(
      0.1,
    )
  })

  it('16:9 auf Tablet-Portrait: kein vertikaler Crop', () => {
    const { containerW, containerH } = cardPeekContainer('tabletPortrait')
    const band = visibleYNormalRange(
      ASPECT_16_9,
      containerW,
      containerH,
      MIN_PAN_DISPLAY_RATIO,
    )
    expect(band.yMin).toBe(0)
    expect(band.yMax).toBe(1)
  })

  it('Hero-Cap 520 würde 4:3-Crop stark erhöhen (Regressions-Guard)', () => {
    const containerW = 672
    const uncapped = cropFraction(ASPECT_4_3, containerW, 920)
    const capped = cropFraction(ASPECT_4_3, containerW, 520)
    expect(capped).toBeGreaterThan(uncapped)
    expect(capped).toBeGreaterThan(0.4)
  })
})

describe('stations-hotspot-coverage (Forward-Guard)', () => {
  it('dokumentiert sichtbare Y-Bänder für flat 4:3-Stationen ohne Hotspots', () => {
    const flat = getAllStations().filter(isFlatViewer)
    expect(flat.map((s) => s.slug).sort()).toEqual(
      ['hort', 'kunst', 'schulsozialarbeit'].sort(),
    )

    for (const preset of ['phone', 'tabletPortrait'] as const) {
      const { containerW, containerH } = cardPeekContainer(preset)
      const band = visibleYNormalRange(
        ASPECT_4_3,
        containerW,
        containerH,
        MIN_PAN_DISPLAY_RATIO,
      )
      expect(band.yMax - band.yMin).toBeGreaterThan(0.5)
    }
  })

  it('alle flat Hotspot-y liegen im sichtbaren Band (Phone + Tablet)', () => {
    const stations = flatStationsWithHotspots()
    if (stations.length === 0) {
      expect(stations).toHaveLength(0)
      return
    }

    for (const station of stations) {
      const aspect = ASPECT_4_3
      for (const preset of ['phone', 'tabletPortrait'] as const) {
        const { containerW, containerH } = cardPeekContainer(preset)
        const band = visibleYNormalRange(
          aspect,
          containerW,
          containerH,
          MIN_PAN_DISPLAY_RATIO,
        )
        for (const hs of station.hotspots ?? []) {
          if (hs.action === 'dialog') {
            continue
          }
          assertHotspotInBand(hs, band)
        }
      }
    }
  })
})

function assertHotspotInBand(
  hs: Hotspot,
  band: { yMin: number; yMax: number },
): void {
  expect(
    hs.y,
    `Hotspot ${hs.id} y=${hs.y} außerhalb [${band.yMin}, ${band.yMax}]`,
  ).toBeGreaterThanOrEqual(band.yMin)
  expect(hs.y).toBeLessThanOrEqual(band.yMax)
}
