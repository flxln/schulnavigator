import { describe, expect, it } from 'vitest'
import {
  getUnlockedSlugsForMode,
  isHubFullyLocked,
  isHubStationNavigable,
} from '@/lib/hub-mode'

const SLUGS = ['a', 'b', 'c'] as const

describe('getUnlockedSlugsForMode', () => {
  it('heft: alle Slugs frei', () => {
    const unlocked = getUnlockedSlugsForMode('heft', SLUGS, new Set())
    expect(unlocked).toEqual(new Set(['a', 'b', 'c']))
  })

  it('fest ohne Besuche: keine Slugs frei', () => {
    const unlocked = getUnlockedSlugsForMode('fest', SLUGS, new Set())
    expect(unlocked.size).toBe(0)
  })

  it('fest: nur besuchte Slugs frei', () => {
    const unlocked = getUnlockedSlugsForMode(
      'fest',
      SLUGS,
      new Set(['a', 'c']),
    )
    expect(unlocked).toEqual(new Set(['a', 'c']))
  })

  it('fest: alle besucht', () => {
    const unlocked = getUnlockedSlugsForMode(
      'fest',
      SLUGS,
      new Set(['a', 'b', 'c']),
    )
    expect(unlocked.size).toBe(3)
  })
})

describe('isHubStationNavigable', () => {
  it('true wenn Slug in unlockedSlugs', () => {
    expect(isHubStationNavigable('a', new Set(['a']))).toBe(true)
    expect(isHubStationNavigable('b', new Set(['a']))).toBe(false)
  })
})

describe('isHubFullyLocked', () => {
  it('fest ohne Freischaltung: gesperrt', () => {
    expect(isHubFullyLocked('fest', new Set(), 12)).toBe(true)
  })

  it('fest mit mindestens einer Station: nicht voll gesperrt', () => {
    expect(isHubFullyLocked('fest', new Set(['musik']), 12)).toBe(false)
  })

  it('heft: nie voll gesperrt', () => {
    expect(isHubFullyLocked('heft', new Set(), 12)).toBe(false)
  })
})
