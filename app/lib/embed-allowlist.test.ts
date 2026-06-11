import { describe, expect, it } from 'vitest'
import {
  DEFAULT_EMBED_ALLOW_SUFFIXES,
  embedAllowlistToCspFrameSrc,
  hostMatchesEmbedAllowlist,
  isEmbedAllowSubset,
  isEmbedUrlAllowed,
} from '@/lib/embed-allowlist'

describe('hostMatchesEmbedAllowlist', () => {
  const suffixes = ['delightex.com']

  it('matcht Apex und Subdomain', () => {
    expect(hostMatchesEmbedAllowlist('delightex.com', suffixes)).toBe(true)
    expect(hostMatchesEmbedAllowlist('edu.delightex.com', suffixes)).toBe(true)
  })

  it('lehnt ähnliche aber falsche Hosts ab', () => {
    expect(hostMatchesEmbedAllowlist('evil-delightex.com', suffixes)).toBe(false)
    expect(hostMatchesEmbedAllowlist('notdelightex.com', suffixes)).toBe(false)
    expect(hostMatchesEmbedAllowlist('delightex.com.attacker.tld', suffixes)).toBe(
      false,
    )
  })
})

describe('isEmbedUrlAllowed', () => {
  it('akzeptiert gültige Delightex-HTTPS-URL', () => {
    expect(
      isEmbedUrlAllowed('https://edu.delightex.com/share/abc', [
        'delightex.com',
      ]),
    ).toBe(true)
  })

  it('lehnt http und fremde Domain ab', () => {
    expect(
      isEmbedUrlAllowed('http://edu.delightex.com/x', ['delightex.com']),
    ).toBe(false)
    expect(
      isEmbedUrlAllowed('https://example.com/x', ['delightex.com']),
    ).toBe(false)
  })
})

describe('isEmbedAllowSubset', () => {
  it('akzeptiert Default-Subset', () => {
    expect(isEmbedAllowSubset(['delightex.com'])).toBe(true)
  })

  it('lehnt unbekannte Domains ab', () => {
    expect(isEmbedAllowSubset(['foo.com'])).toBe(false)
  })
})

describe('embedAllowlistToCspFrameSrc', () => {
  it('enthält Wildcard und Apex', () => {
    const csp = embedAllowlistToCspFrameSrc(DEFAULT_EMBED_ALLOW_SUFFIXES)
    expect(csp).toContain('https://*.delightex.com')
    expect(csp).toContain('https://delightex.com')
  })
})
