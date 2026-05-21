import { describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import { validateStationsFile } from '@/lib/validate-stations'

describe('validateStationsFile puzzleSegmentId', () => {
  it('wirft bei doppeltem puzzleSegmentId', () => {
    const broken = structuredClone(raw) as {
      stations: { puzzleSegmentId: string }[]
    }
    broken.stations[1]!.puzzleSegmentId = broken.stations[0]!.puzzleSegmentId
    expect(() => validateStationsFile(broken as unknown)).toThrow(
      'doppeltes puzzleSegmentId',
    )
  })
})
