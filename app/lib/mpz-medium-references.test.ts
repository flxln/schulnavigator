import { describe, expect, it } from 'vitest'
import { getStationBySlug } from '@/lib/stations'
import {
  collectStationMediaPaths,
  findMediumHotspotReferences,
  isMediaPathStillReferenced,
} from '@/lib/mpz-medium-references'
import type { Station } from '@/lib/types'

describe('mpz-medium-references', () => {
  it('findMediumHotspotReferences: leer wenn keine Treffer', () => {
    const station = getStationBySlug('hort')!
    expect(findMediumHotspotReferences(station, 'x')).toEqual({ flat: [], sphere: [] })
  })

  it('findMediumHotspotReferences: sphere-Hotspot', () => {
    const station = getStationBySlug('klassenzimmer')!
    const refs = findMediumHotspotReferences(station, 'dx-schule-zukunft')
    expect(refs.sphere).toContain('hs-dx-embed')
    expect(refs.flat).toEqual([])
  })

  it('findMediumHotspotReferences: dialog-Hotspot ignoriert', () => {
    const station: Pick<Station, 'hotspots' | 'hotspots360'> = {
      hotspots: [
        {
          id: 'dlg',
          x: 0.1,
          y: 0.2,
          action: 'dialog',
          mascot: 'frieda',
        },
      ],
    }
    expect(findMediumHotspotReferences(station, 'any')).toEqual({ flat: [], sphere: [] })
  })

  it('collectStationMediaPaths erfasst Medien, Hotspot-Icons und Dialog', () => {
    const station = getStationBySlug('klassenzimmer')!
    const paths = collectStationMediaPaths(station)
    expect(paths).toContain('https://edu.delightex.com/ABE-XQJ')
    expect(paths).toContain('/stations-icons/klassenzimmer/embed.svg')
    expect(paths).toContain('/stations/klassenzimmer.jpg')
    expect(paths).toContain('/stations/360/klassenzimmer.jpg')
  })

  it('isMediaPathStillReferenced: Icon bleibt referenziert wenn Medium entfernt wird', () => {
    const station = getStationBySlug('klassenzimmer')!
    const shared = '/stations-icons/klassenzimmer/embed.svg'
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'dx-schule-zukunft'),
    }
    expect(isMediaPathStillReferenced(filtered, shared)).toBe(true)
  })

  it('isMediaPathStillReferenced: false wenn Pfad nur einmal referenziert war', () => {
    const station = getStationBySlug('musik')!
    const onlyAudio = '/media/musik/audio/musikzimmer-fuer-elise.mp3'
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'musik-musikzimmer-fuer-elise'),
    }
    expect(isMediaPathStillReferenced(filtered, onlyAudio)).toBe(false)
  })

  it('isMediaPathStillReferenced: Icon-Sharing über Medien und Hotspot', () => {
    const shared = '/stations-icons/pc-raum/video.svg'
    const station: Station = {
      slug: 'pc-raum',
      titel: 'PC-Raum',
      beschreibung: 'Test',
      bild: '/stations/pc-raum.jpg',
      medien: [
        {
          id: 'm1',
          typ: 'video',
          quelle: '/media/pc-raum/video/a.mp4',
          thumbnail: shared,
        },
      ],
      hotspots360: [
        {
          id: 'hs1',
          yaw: 0,
          pitch: 0,
          mediumId: 'm1',
          icon: shared,
        },
      ],
    }
    expect(collectStationMediaPaths(station).filter((p) => p === shared).length).toBeGreaterThan(1)
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'm1'),
    }
    expect(isMediaPathStillReferenced(filtered, shared)).toBe(true)
  })
})
