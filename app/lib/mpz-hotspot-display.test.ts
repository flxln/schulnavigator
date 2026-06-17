import { describe, expect, it } from 'vitest'
import {
  formatHotspotCoordsFlat,
  formatHotspotCoordsSphere,
  formatHotspotRowLink,
  resolveHotspotRowLink,
} from '@/lib/mpz-hotspot-display'

describe('mpz-hotspot-display', () => {
  it('formatHotspotCoordsFlat rundet auf 4 Dezimalen', () => {
    expect(formatHotspotCoordsFlat({ id: 'h1', x: 0.452123, y: 0.318789 })).toBe(
      '0.4521, 0.3188',
    )
  })

  it('formatHotspotCoordsSphere zeigt Grad', () => {
    expect(
      formatHotspotCoordsSphere({ id: 'h1', yaw: -45, pitch: 12.5 }),
    ).toBe('-45°, 12.5°')
  })

  it('resolveHotspotRowLink medium', () => {
    expect(resolveHotspotRowLink({ id: 'h1', mediumId: 'demo-video' })).toEqual({
      kind: 'medium',
      mediumId: 'demo-video',
    })
  })

  it('resolveHotspotRowLink dialog', () => {
    expect(
      resolveHotspotRowLink({
        id: 'h1',
        action: 'dialog',
        mascot: 'frieda',
        yaw: 0,
        pitch: 0,
      }),
    ).toEqual({ kind: 'dialog', mascot: 'frieda' })
  })

  it('formatHotspotRowLink Fallback', () => {
    expect(formatHotspotRowLink({ id: 'h1' })).toBe('—')
    expect(
      formatHotspotRowLink({ id: 'h1', action: 'dialog', mascot: 'otto' }),
    ).toBe('Maskottchen: otto')
  })
})
