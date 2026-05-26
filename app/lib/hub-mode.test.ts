import { describe, expect, it } from 'vitest'
import { getUnlockedSegmentIdsForMode } from '@/lib/hub-mode'

const SEGMENTS = [
  { slug: 'a', puzzleSegmentId: 'seg-01' },
  { slug: 'b', puzzleSegmentId: 'seg-02' },
  { slug: 'c', puzzleSegmentId: 'seg-03' },
] as const

describe('getUnlockedSegmentIdsForMode', () => {
  it('heft: alle Segmente frei', () => {
    const ids = getUnlockedSegmentIdsForMode('heft', SEGMENTS, new Set())
    expect(ids).toEqual(new Set(['seg-01', 'seg-02', 'seg-03']))
  })

  it('fest ohne Besuche: nichts frei', () => {
    const ids = getUnlockedSegmentIdsForMode('fest', SEGMENTS, new Set())
    expect(ids.size).toBe(0)
  })

  it('fest: nur besuchte Slugs frei', () => {
    const ids = getUnlockedSegmentIdsForMode(
      'fest',
      SEGMENTS,
      new Set(['a', 'c']),
    )
    expect(ids).toEqual(new Set(['seg-01', 'seg-03']))
  })

  it('fest: alle besucht', () => {
    const ids = getUnlockedSegmentIdsForMode(
      'fest',
      SEGMENTS,
      new Set(['a', 'b', 'c']),
    )
    expect(ids.size).toBe(3)
  })
})
