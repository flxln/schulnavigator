import { describe, expect, it } from 'vitest'
import {
  getViewerChangeWarnings,
  hasBlockingHotspots,
} from '@/lib/mpz-viewer-warnings'

describe('mpz-viewer-warnings', () => {
  it('gleicher Viewer → keine Warnungen', () => {
    expect(
      getViewerChangeWarnings(
        { viewer: 'flat', hotspots: undefined, hotspots360: undefined },
        'flat',
      ),
    ).toEqual([])
  })

  it('flat → equirectangular ohne panorama360 → missing-panorama', () => {
    const warnings = getViewerChangeWarnings(
      { viewer: 'flat', hotspots: undefined, hotspots360: undefined },
      'equirectangular',
    )
    expect(warnings.map((w) => w.kind)).toContain('missing-panorama')
  })

  it('flat → equirectangular mit hotspots → flat-hotspots-present', () => {
    const warnings = getViewerChangeWarnings(
      {
        viewer: 'flat',
        hotspots: [{ id: 'h1', label: 'x', x: 0.1, y: 0.2, action: 'medium', mediumId: 'm1' }],
        hotspots360: undefined,
      },
      'equirectangular',
    )
    expect(warnings.map((w) => w.kind)).toContain('flat-hotspots-present')
  })

  it('equirectangular → flat mit hotspots360 → sphere-hotspots-present', () => {
    const warnings = getViewerChangeWarnings(
      {
        viewer: 'equirectangular',
        panorama360: '/stations/360/x.jpg',
        hotspots360: [{ id: 'h1', label: 'y', yaw: 0, pitch: 0, action: 'medium', mediumId: 'm1' }],
      },
      'flat',
    )
    expect(warnings.map((w) => w.kind)).toContain('sphere-hotspots-present')
  })

  it('hasBlockingHotspots: leere Arrays zählen nicht', () => {
    expect(
      hasBlockingHotspots({ hotspots: [], hotspots360: [] }),
    ).toBe(false)
  })

  it('hasBlockingHotspots: nicht-leeres Array zählt', () => {
    expect(
      hasBlockingHotspots({
        hotspots: [{ id: 'h1', label: 'x', x: 0, y: 0, action: 'medium', mediumId: 'm' }],
        hotspots360: [],
      }),
    ).toBe(true)
  })
})
