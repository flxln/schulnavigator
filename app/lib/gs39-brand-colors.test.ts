import { describe, expect, it } from 'vitest'
import { GS39_BRAND_HEX, GS39_STATION_ACCENT_HEX } from './gs39-brand-colors'
import { getAllStations } from './stations'

describe('gs39-brand-colors', () => {
  it('uses hex literals without css var()', () => {
    for (const value of Object.values(GS39_BRAND_HEX)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('defines accent for every station slug', () => {
    const stations = getAllStations()
    expect(stations.length).toBe(11)
    for (const s of stations) {
      expect(GS39_STATION_ACCENT_HEX[s.slug]).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
