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
    const refs = findMediumHotspotReferences(station, 'demo-video')
    expect(refs.sphere).toContain('hs-video')
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
    expect(paths).toContain('/media/klassenzimmer/fotos/grundschule_demo.jpg')
    expect(paths).toContain('/stations/klassenzimmer.jpg')
    expect(paths).toContain('/stations/360/klassenzimmer.jpg')
  })

  it('isMediaPathStillReferenced: Sharing grundschule_demo.jpg nach demo-foto entfernt', () => {
    const station = getStationBySlug('klassenzimmer')!
    const shared = '/media/klassenzimmer/fotos/grundschule_demo.jpg'
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'demo-foto'),
    }
    expect(isMediaPathStillReferenced(filtered, shared)).toBe(true)
  })

  it('isMediaPathStillReferenced: false wenn Pfad nur einmal referenziert war', () => {
    const station = getStationBySlug('klassenzimmer')!
    const onlyAudio = '/media/klassenzimmer/audio/grundschule_demo.mp3'
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'demo-audio'),
    }
    expect(isMediaPathStillReferenced(filtered, onlyAudio)).toBe(false)
  })

  it('isMediaPathStillReferenced: SVG-Sharing pc-raum delightex', () => {
    const station = getStationBySlug('pc-raum')!
    const shared = '/media/pc-raum/icons/delightex.svg'
    expect(collectStationMediaPaths(station).filter((p) => p === shared).length).toBeGreaterThan(1)
    const filtered: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== 'pc-delightex'),
    }
    expect(isMediaPathStillReferenced(filtered, shared)).toBe(true)
  })
})
