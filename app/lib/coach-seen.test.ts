import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  coachStorageKey,
  EMPTY_COACH_SEEN_STATE,
  isCoachSeen,
  markCoachSeen,
  markCoachSuperseded,
  parseCoachSeenState,
  readCoachSeenState,
} from '@/lib/coach-seen'

function createStorageMock() {
  const map = new Map<string, string>()
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
  }
  return storage
}

describe('coach-seen', () => {
  beforeEach(() => {
    const storage = createStorageMock()
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('window', {
      localStorage: storage,
      dispatchEvent: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parst leeren Storage als Default', () => {
    expect(parseCoachSeenState(null)).toEqual(EMPTY_COACH_SEEN_STATE)
  })

  it('parst gültigen State', () => {
    expect(
      parseCoachSeenState(
        JSON.stringify({ version: 1, seen: ['a'], suppressed: ['b'] }),
      ),
    ).toEqual({ version: 1, seen: ['a'], suppressed: ['b'] })
  })

  it('fällt bei korruptem JSON auf Default zurück', () => {
    expect(parseCoachSeenState('not-json')).toEqual(EMPTY_COACH_SEEN_STATE)
  })

  it('fällt bei falscher version auf Default zurück', () => {
    expect(
      parseCoachSeenState(JSON.stringify({ version: 2, seen: [], suppressed: [] })),
    ).toEqual(EMPTY_COACH_SEEN_STATE)
  })

  it('isCoachSeen berücksichtigt seen und suppressed', () => {
    const state = { version: 1 as const, seen: ['a'], suppressed: ['b'] }
    expect(isCoachSeen('a', state)).toBe(true)
    expect(isCoachSeen('b', state)).toBe(true)
    expect(isCoachSeen('c', state)).toBe(false)
  })

  it('markCoachSeen schreibt modus-getrennt', () => {
    markCoachSeen('welcome-hub', 'fest')
    markCoachSeen('first-visit', 'heft')
    expect(readCoachSeenState('fest').seen).toEqual(['welcome-hub'])
    expect(readCoachSeenState('heft').seen).toEqual(['first-visit'])
    expect(coachStorageKey('fest')).not.toBe(coachStorageKey('heft'))
  })

  it('markCoachSuperseded ergänzt suppressed ohne Duplikate', () => {
    markCoachSeen('welcome-hub', 'heft')
    markCoachSuperseded(['first-visit', 'welcome-hub'], 'heft')
    const state = readCoachSeenState('heft')
    expect(state.suppressed).toEqual(['first-visit'])
    expect(state.seen).toEqual(['welcome-hub'])
  })
})
