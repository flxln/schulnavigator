import { describe, expect, it } from 'vitest'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import { getHubSlugMap } from '@/lib/schoolhouse-hub-map'
import {
  getStationBadgeStyle,
  getStationIconDef,
  STATION_ICON_BY_SLUG,
} from '@/lib/station-icons'

describe('station-icons', () => {
  it('definiert Icons für alle Hub-Slugs', () => {
    for (const slug of Object.keys(getHubSlugMap())) {
      expect(STATION_ICON_BY_SLUG[slug as keyof typeof STATION_ICON_BY_SLUG]).toBeDefined()
      expect(getStationIconDef(slug).type).toBe('lucide')
    }
  })

  it('wirft bei unbekanntem Slug', () => {
    expect(() => getStationIconDef('unbekannt')).toThrow('kein Icon')
  })

  it('getStationBadgeStyle: unbesucht ist muted mit navy300', () => {
    const style = getStationBadgeStyle({
      visited: false,
      accent: '#1f6abb',
    })
    expect(style.muted).toBe(true)
    expect(style.iconColor).toBe(GS39_BRAND_HEX.navy300)
    expect(style.locked).toBe(false)
  })

  it('getStationBadgeStyle: besucht nutzt Akzentfarbe', () => {
    const accent = '#1f6abb'
    const style = getStationBadgeStyle({
      visited: true,
      accent,
    })
    expect(style.muted).toBe(false)
    expect(style.iconColor).toBe(accent)
  })

  it('getStationBadgeStyle: locked ist eigene Achse', () => {
    const style = getStationBadgeStyle({
      visited: false,
      locked: true,
      accent: '#1f6abb',
    })
    expect(style.locked).toBe(true)
    expect(style.muted).toBe(true)
  })
})
