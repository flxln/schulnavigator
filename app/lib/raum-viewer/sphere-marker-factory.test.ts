/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { buildSphereMarkerConfig } from '@/lib/raum-viewer/sphere-marker-factory'
import type { Hotspot360 } from '@/lib/types'

const dialogHs: Hotspot360 = {
  id: 'hs-frieda',
  label: 'Frieda',
  yaw: 5,
  pitch: -28,
  action: 'dialog',
  mascot: 'frieda',
  mascotSize: 0.5,
}

describe('buildSphereMarkerConfig', () => {
  it('liefert element-Maskottchen mit bottom-center-Anker', () => {
    const built = buildSphereMarkerConfig({
      hs: dialogHs,
      medien: [],
      containerHeight: 400,
      isActive: false,
    })
    expect(built.kind).toBe('htmlMascot')
    expect(built.config.anchor).toBe('bottom center')
    expect(built.config.element).toBeInstanceOf(HTMLElement)
    expect(built.mascotElement?.querySelector('img')).toBeTruthy()
  })

  it('liefert imageLayer für Medien mit icon', () => {
    const hs: Hotspot360 = {
      id: 'hs-delightex',
      yaw: 0,
      pitch: 0,
      mediumId: 'pc-delightex',
      icon: '/stations-icons/pc-raum/delightex.svg',
      iconSize: 0.1,
    }
    const built = buildSphereMarkerConfig({
      hs,
      medien: [],
      containerHeight: 500,
      isActive: true,
    })
    expect(built.kind).toBe('imageLayer')
    expect(built.config.imageLayer).toBe('/stations-icons/pc-raum/delightex.svg')
    expect(built.config.size).toMatchObject({
      width: expect.any(Number),
      height: expect.any(Number),
    })
    expect(built.config.anchor).toBe('center center')
  })

  it('liefert imageLayer für Medien mit typ-Preset', () => {
    const hs: Hotspot360 = {
      id: 'hs-audio',
      yaw: 0,
      pitch: 0,
      mediumId: 'demo-audio',
    }
    const built = buildSphereMarkerConfig({
      hs,
      medien: [{ id: 'demo-audio', typ: 'audio', quelle: '/x.mp3' }],
      containerHeight: 400,
      isActive: false,
    })
    expect(built.kind).toBe('imageLayer')
    expect(built.config.imageLayer).toBe('/brand/hotspot-icons/audio.svg')
  })

  it('liefert htmlDot-Fallback ohne Bildquelle', () => {
    const hs: Hotspot360 = {
      id: 'hs-empty',
      yaw: 0,
      pitch: 0,
      mediumId: 'missing',
    }
    const built = buildSphereMarkerConfig({
      hs,
      medien: [],
      containerHeight: 400,
      isActive: false,
    })
    expect(built.kind).toBe('htmlDot')
    expect(built.config.html).toContain('svg')
  })
})
