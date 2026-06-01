import { describe, expect, it } from 'vitest'
import { getNextStation } from '@/lib/next-station'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'

function stub(slug: string, nr: number): IsometricHubStation {
  return {
    slug,
    titel: slug,
    nr,
    room: 'top-left',
    accent: '#112233',
    visitedGlassFill: '#a',
    visitedDoorFill: '#b',
    visitedGymGlassFill: '#c',
  }
}

const STATIONS = [stub('a', 1), stub('b', 2), stub('c', 3)] as const

describe('getNextStation', () => {
  it('leere Liste → null', () => {
    expect(getNextStation([], new Set())).toBeNull()
  })

  it('ohne fromSlug: erste unbesuchte', () => {
    expect(getNextStation(STATIONS, new Set(['a']))?.slug).toBe('b')
    expect(getNextStation(STATIONS, new Set())?.slug).toBe('a')
  })

  it('mit fromSlug: nächste unbesuchte danach inkl. Wraparound', () => {
    expect(getNextStation(STATIONS, new Set(['b']), 'a')?.slug).toBe('c')
    expect(getNextStation(STATIONS, new Set(), 'c')?.slug).toBe('a')
  })

  it('überspringt besuchte Räume', () => {
    expect(getNextStation(STATIONS, new Set(['b']), 'a')?.slug).toBe('c')
  })

  it('alle besucht → null', () => {
    expect(getNextStation(STATIONS, new Set(['a', 'b', 'c']))).toBeNull()
  })

  it('fromSlug unbekannt → erste unbesuchte', () => {
    expect(getNextStation(STATIONS, new Set(['a']), 'unknown')?.slug).toBe('b')
  })

  it('fromSlug: schlägt aktuellen Raum nicht vor', () => {
    expect(getNextStation(STATIONS, new Set(['b', 'c']), 'a')).toBeNull()
  })
})
