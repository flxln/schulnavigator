import { describe, expect, it } from 'vitest'
import {
  FALLBACK_EMBED_ALLOW_SUFFIXES,
  getEmbedAllowSuffixes,
  embedAllowlistToCspFrameSrc,
  hostMatchesEmbedAllowlist,
  isBookCreatorUrl,
  isEmbedAllowSubset,
  isEmbedUrlAllowed,
} from '@/lib/embed-allowlist'

describe('getEmbedAllowSuffixes', () => {
  it('lädt Suffixe aus embed-allowlist.json', () => {
    const suffixes = getEmbedAllowSuffixes()
    expect(suffixes).toContain('delightex.com')
    expect(suffixes).toContain('bookcreator.com')
  })
})

describe('hostMatchesEmbedAllowlist', () => {
  const suffixes = ['delightex.com', 'bookcreator.com']

  it('matcht Apex und Subdomain', () => {
    expect(hostMatchesEmbedAllowlist('delightex.com', suffixes)).toBe(true)
    expect(hostMatchesEmbedAllowlist('edu.delightex.com', suffixes)).toBe(true)
    expect(hostMatchesEmbedAllowlist('read.bookcreator.com', suffixes)).toBe(true)
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

  it('akzeptiert gültige Book-Creator-HTTPS-URL', () => {
    expect(
      isEmbedUrlAllowed(
        'https://read.bookcreator.com/2MfAUZf5kWdGbFsdRTyW50qOUeT2/4GMz8K3eSy2Sv6RbTbo6_A',
        ['bookcreator.com'],
      ),
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
    expect(isEmbedAllowSubset(['bookcreator.com'])).toBe(true)
    expect(isEmbedAllowSubset(['delightex.com', 'bookcreator.com'])).toBe(true)
  })

  it('lehnt unbekannte Domains ab', () => {
    expect(isEmbedAllowSubset(['foo.com'])).toBe(false)
  })

  it('prüft gegen explizit übergebene globale Liste', () => {
    expect(isEmbedAllowSubset(['foo.com'], ['foo.com', 'bar.com'])).toBe(true)
    expect(isEmbedAllowSubset(['baz.com'], ['foo.com', 'bar.com'])).toBe(false)
  })
})

describe('embedAllowlistToCspFrameSrc', () => {
  it('enthält Wildcard und Apex', () => {
    const csp = embedAllowlistToCspFrameSrc(FALLBACK_EMBED_ALLOW_SUFFIXES)
    expect(csp).toContain('https://*.delightex.com')
    expect(csp).toContain('https://delightex.com')
    expect(csp).toContain('https://*.bookcreator.com')
    expect(csp).toContain('https://bookcreator.com')
  })
})

describe('isBookCreatorUrl', () => {
  it('erkennt read.bookcreator.com', () => {
    expect(
      isBookCreatorUrl(
        'https://read.bookcreator.com/2MfAUZf5kWdGbFsdRTyW50qOUeT2/4GMz8K3eSy2Sv6RbTbo6_A',
      ),
    ).toBe(true)
  })

  it('lehnt andere Domains ab', () => {
    expect(isBookCreatorUrl('https://edu.delightex.com/x')).toBe(false)
    expect(isBookCreatorUrl('https://example.com/x')).toBe(false)
  })
})
