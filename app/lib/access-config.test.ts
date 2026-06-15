import { afterEach, describe, expect, it } from 'vitest'
import {
  getAccessMode,
  parseAccessMode,
  resetAccessConfigCacheForTests,
} from '@/lib/access-config'

describe('parseAccessMode', () => {
  it('defaultet auf gated', () => {
    expect(parseAccessMode(undefined)).toBe('gated')
    expect(parseAccessMode('')).toBe('gated')
    expect(parseAccessMode('quatsch')).toBe('gated')
  })

  it('akzeptiert open', () => {
    expect(parseAccessMode('open')).toBe('open')
  })
})

describe('getAccessMode', () => {
  const envSnapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...envSnapshot }
    resetAccessConfigCacheForTests()
  })

  it('liest SN_ACCESS_MODE aus ENV', () => {
    process.env.SN_ACCESS_MODE = 'open'
    expect(getAccessMode()).toBe('open')
  })
})
