/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotspotOverlay } from '@/components/raum-viewer/hotspot-overlay'
import {
  DEFAULT_ICON_SIZE_NORM,
  DEFAULT_MASCOT_SIZE_NORM,
} from '@/lib/raum-viewer/constants'
import type { Hotspot, Medium } from '@/lib/types'

const dialogHotspot = (overrides: Partial<Hotspot> = {}): Hotspot => ({
  id: 'hs-frieda',
  label: 'Frieda',
  x: 0.32,
  y: 0.78,
  action: 'dialog',
  mascot: 'frieda',
  ...overrides,
})

function mascotImg(): HTMLImageElement {
  const btn = screen.getByRole('button', { name: /Frieda/ })
  const img = btn.querySelector('img')
  if (!img) {
    throw new Error('Maskottchen-<img> fehlt')
  }
  return img
}

afterEach(() => {
  cleanup()
})

describe('HotspotOverlay mascotSize', () => {
  it('setzt px-Höhe aus mascotSize × containerHeight', () => {
    render(
      <HotspotOverlay
        hotspots={[dialogHotspot({ mascotSize: 0.4 })]}
        medien={[]}
        containerHeight={500}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    expect(mascotImg().style.height).toBe('200px')
    expect(mascotImg().style.width).toBe('auto')
  })

  it('nutzt Default × containerHeight ohne mascotSize', () => {
    render(
      <HotspotOverlay
        hotspots={[dialogHotspot()]}
        medien={[]}
        containerHeight={500}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    expect(mascotImg().style.height).toBe(`${DEFAULT_MASCOT_SIZE_NORM * 500}px`)
  })

  it('mappt viewport-y=1 auf unteren sichtbaren Bildrand bei Zoom', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={[dialogHotspot({ y: 1 })]}
        medien={[]}
        containerHeight={500}
        yBand={{ yMin: 0.269, yMax: 0.731 }}
        onHotspotTap={vi.fn()}
      />,
    )

    const li = container.querySelector('li')
    expect(li?.getAttribute('style')).toContain('top: 73.1%')
  })

  it('spiegelt bei mascotFlipX horizontal am Fußpunkt', () => {
    const { container } = render(
      <HotspotOverlay
        hotspots={[dialogHotspot({ mascotFlipX: true })]}
        medien={[]}
        containerHeight={500}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    const flip = container.querySelector('.sn-dialog-mascot__img--flip-x')
    expect(flip).not.toBeNull()
  })
})

const mediaHotspot = (overrides: Partial<Hotspot> = {}): Hotspot => ({
  id: 'hs-video',
  label: 'Tafel',
  x: 0.35,
  y: 0.38,
  radius: 0.06,
  mediumId: 'demo-video',
  ...overrides,
})

const demoVideo: Medium = {
  id: 'demo-video',
  typ: 'video',
  videoSource: 'upload',
  quelle: '/media/klassenzimmer/video/grundschule_demo.mp4',
  untertitel: 'Mein Schultag (Video)',
}

function mediaMarkerImg(): HTMLImageElement {
  const btn = screen.getByRole('button', { name: /Tafel/ })
  const img = btn.querySelector('img')
  if (!img) {
    throw new Error('Medien-Marker-<img> fehlt')
  }
  return img
}

describe('HotspotOverlay Medien-Marker', () => {
  it('rendert icon als Bild-Marker mit iconSize × containerHeight', () => {
    render(
      <HotspotOverlay
        hotspots={[
          mediaHotspot({
            icon: '/media/klassenzimmer/icons/play.svg',
            iconSize: 0.1,
          }),
        ]}
        medien={[demoVideo]}
        containerHeight={600}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    const img = mediaMarkerImg()
    expect(img.getAttribute('src')).toBe('/media/klassenzimmer/icons/play.svg')
    expect(img.style.height).toBe('60px')
  })

  it('nutzt thumbnail des Mediums ohne icon', () => {
    render(
      <HotspotOverlay
        hotspots={[mediaHotspot()]}
        medien={[
          {
            ...demoVideo,
            thumbnail: '/media/klassenzimmer/fotos/grundschule_demo.jpg',
          },
        ]}
        containerHeight={400}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    const img = mediaMarkerImg()
    expect(img.getAttribute('src')).toBe(
      '/media/klassenzimmer/fotos/grundschule_demo.jpg',
    )
    expect(img.style.height).toBe(`${DEFAULT_ICON_SIZE_NORM * 400}px`)
  })

  it('nutzt Typ-Preset wenn weder icon noch thumbnail', () => {
    render(
      <HotspotOverlay
        hotspots={[mediaHotspot()]}
        medien={[demoVideo]}
        containerHeight={500}
        yBand={{ yMin: 0, yMax: 1 }}
        onHotspotTap={vi.fn()}
      />,
    )

    const img = mediaMarkerImg()
    expect(img.getAttribute('src')).toBe('/brand/hotspot-icons/video.svg')
  })
})
