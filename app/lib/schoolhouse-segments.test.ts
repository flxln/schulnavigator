import { describe, expect, it } from 'vitest'
import { buildSchoolhouseSegments } from '@/lib/schoolhouse-segments'
import { getAllStations } from '@/lib/stations'

describe('buildSchoolhouseSegments', () => {
  it('merged 11 Stationen mit korrekter slug-Zuordnung', () => {
    const segs = buildSchoolhouseSegments(getAllStations())
    expect(segs).toHaveLength(11)
    const musik = segs.find((s) => s.slug === 'musik')
    expect(musik?.puzzleSegmentId).toBe('seg-10')
    expect(musik?.label).toBe('Musik')
    const ssa = segs.find((s) => s.slug === 'schulsozialarbeit')
    expect(ssa?.labelShort).toBe('Sozialarbeit')
  })

  it('wirft wenn eine Station für ein Layout-Segment fehlt', () => {
    const all = getAllStations()
    const ohneMusik = all.filter((s) => s.slug !== 'musik')
    expect(() => buildSchoolhouseSegments(ohneMusik)).toThrow(
      'keine Station für puzzleSegmentId "seg-10"',
    )
  })
})
