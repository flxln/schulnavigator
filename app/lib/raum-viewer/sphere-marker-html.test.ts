import { describe, expect, it } from 'vitest'
import { buildSphereMarkerHtml } from '@/lib/raum-viewer/sphere-marker-html'
import type { Hotspot360 } from '@/lib/types'

const dialogHs: Hotspot360 = {
  id: 'hs-frieda',
  label: 'Frieda',
  yaw: 0,
  pitch: -10,
  action: 'dialog',
  mascot: 'frieda',
  mascotSize: 0.5,
}

describe('buildSphereMarkerHtml', () => {
  it('rendert Maskottchen-PNG für Dialog-Hotspots', () => {
    const html = buildSphereMarkerHtml({
      hs: dialogHs,
      medien: [],
      containerHeight: 400,
      isActive: false,
    })
    expect(html).toContain('/brand/mascots/frieda.png')
    expect(html).toContain('sn-dialog-mascot__img')
    expect(html).toContain('height:200px')
  })

  it('rendert Icon-Bild für Medien-Hotspots mit icon', () => {
    const hs: Hotspot360 = {
      id: 'hs-delightex',
      yaw: 0,
      pitch: 0,
      mediumId: 'pc-delightex',
      icon: '/media/pc-raum/icons/delightex.svg',
      iconSize: 0.1,
    }
    const html = buildSphereMarkerHtml({
      hs,
      medien: [],
      containerHeight: 500,
      isActive: true,
    })
    expect(html).toContain('/media/pc-raum/icons/delightex.svg')
    expect(html).toContain('ring-accent')
  })
})
