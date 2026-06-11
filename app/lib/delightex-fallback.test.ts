import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DELIGHTEX_APP_STORE_URL,
  DELIGHTEX_PLAY_STORE_URL,
  getDelightexStoreUrl,
  isDelightexHost,
  isDelightexUrl,
  shouldSkipEmbedIframe,
} from './delightex-fallback'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('isDelightexHost', () => {
  it('erkennt Apex-Domain', () => {
    expect(isDelightexHost('delightex.com')).toBe(true)
  })

  it('erkennt Subdomain', () => {
    expect(isDelightexHost('edu.delightex.com')).toBe(true)
  })

  it('lehnt evil-delightex.com ab', () => {
    expect(isDelightexHost('evil-delightex.com')).toBe(false)
  })

  it('lehnt notdelightex.com ab', () => {
    expect(isDelightexHost('notdelightex.com')).toBe(false)
  })

  it('lehnt delightex.com.attacker.tld ab', () => {
    expect(isDelightexHost('delightex.com.attacker.tld')).toBe(false)
  })
})

describe('isDelightexUrl', () => {
  it('erkennt gültige Delightex-URL', () => {
    expect(isDelightexUrl('https://edu.delightex.com/WVX-NAQ')).toBe(true)
  })

  it('lehnt andere Domain ab', () => {
    expect(isDelightexUrl('https://example.com/path')).toBe(false)
  })

  it('lehnt http-URL ab', () => {
    expect(isDelightexUrl('http://edu.delightex.com/x')).toBe(false)
  })
})

describe('getDelightexStoreUrl', () => {
  it('gibt App Store URL für iPhone zurück', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    })
    expect(getDelightexStoreUrl()).toBe(DELIGHTEX_APP_STORE_URL)
  })

  it('gibt Play Store URL für Android zurück', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 13)',
    })
    expect(getDelightexStoreUrl()).toBe(DELIGHTEX_PLAY_STORE_URL)
  })

  it('gibt null für Desktop zurück', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    expect(getDelightexStoreUrl()).toBeNull()
  })
})

describe('shouldSkipEmbedIframe', () => {
  it('gibt true zurück bei pointer: coarse', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({ matches: query === '(pointer: coarse)' }),
    })
    expect(shouldSkipEmbedIframe()).toBe(true)
  })

  it('gibt false zurück bei pointer: fine (Desktop)', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    })
    expect(shouldSkipEmbedIframe()).toBe(false)
  })
})
