import { describe, expect, it } from 'vitest'
import { getNextStation } from '@/lib/next-station'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

function stub(slug: string, nr: number): HubStation {
  return {
    slug,
    titel: slug,
    nr,
    slotId: 'fenster-uc-l',
    kind: 'fenster',
    frame: [0, 0, 50, 50],
    accent: '#112233',
    visitedGlassFill: '#aabbcc',
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

  it('fromSlug ist letzter und alle davor besucht → Wrap zu erster unbesuchter', () => {
    expect(getNextStation(STATIONS, new Set(['a']), 'c')?.slug).toBe('b')
  })
})
