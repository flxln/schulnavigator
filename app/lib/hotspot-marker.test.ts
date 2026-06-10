import { describe, expect, it } from 'vitest'
import {
  presetIconForMediumTyp,
  resolveHotspotMarker,
  resolveIconSizeNorm,
} from '@/lib/hotspot-marker'
import type { Hotspot, Medium } from '@/lib/types'

const mediaHotspot = (overrides: Partial<Hotspot> = {}): Hotspot => ({
  id: 'hs-1',
  x: 0.5,
  y: 0.5,
  mediumId: 'm1',
  ...overrides,
})

const videoMedium: Medium = {
  id: 'm1',
  typ: 'video',
  quelle: '/media/x/video.mp4',
}

describe('resolveIconSizeNorm', () => {
  it('nutzt Default 0.1 ohne iconSize', () => {
    expect(resolveIconSizeNorm(mediaHotspot())).toBe(0.1)
  })

  it('clampt iconSize auf MIN/MAX', () => {
    expect(resolveIconSizeNorm(mediaHotspot({ iconSize: 0.01 }))).toBe(0.05)
    expect(resolveIconSizeNorm(mediaHotspot({ iconSize: 0.9 }))).toBe(0.25)
  })
})

describe('resolveHotspotMarker', () => {
  it('bevorzugt hs.icon', () => {
    const marker = resolveHotspotMarker(
      mediaHotspot({ icon: '/media/x/icons/play.svg', iconSize: 0.2 }),
      videoMedium,
      500,
    )
    expect(marker).toEqual({
      kind: 'image',
      src: '/media/x/icons/play.svg',
      heightPx: 100,
    })
  })

  it('nutzt medium.thumbnail ohne icon', () => {
    const marker = resolveHotspotMarker(
      mediaHotspot(),
      { ...videoMedium, thumbnail: '/media/x/thumb.jpg' },
      400,
    )
    expect(marker).toEqual({
      kind: 'image',
      src: '/media/x/thumb.jpg',
      heightPx: 40,
    })
  })

  it('nutzt Typ-Preset ohne icon und thumbnail', () => {
    const marker = resolveHotspotMarker(mediaHotspot(), videoMedium, 300)
    expect(marker).toEqual({
      kind: 'image',
      src: presetIconForMediumTyp('video'),
      heightPx: 30,
    })
  })

  it('liefert dot ohne verknüpftes Medium', () => {
    expect(resolveHotspotMarker(mediaHotspot(), undefined, 300)).toEqual({
      kind: 'dot',
    })
  })

  it('nutzt link-Preset für typ link', () => {
    const linkMedium: Medium = {
      id: 'ext',
      typ: 'link',
      quelle: 'https://example.com',
    }
    const marker = resolveHotspotMarker(mediaHotspot(), linkMedium, 200)
    expect(marker).toEqual({
      kind: 'image',
      src: '/brand/hotspot-icons/link.svg',
      heightPx: 20,
    })
  })
})
