import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isSparkleDone,
  markSparkleDone,
  SPARKLE_DONE_STORAGE_KEY,
} from '@/lib/sparkle-done'

function createStorageMock() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
  }
}

describe('sparkle-done', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ist anfangs nicht gesetzt', () => {
    expect(isSparkleDone()).toBe(false)
  })

  it('markSparkleDone setzt Flag', () => {
    markSparkleDone()
    expect(isSparkleDone()).toBe(true)
    expect(localStorage.getItem(SPARKLE_DONE_STORAGE_KEY)).toBe('1')
  })
})
