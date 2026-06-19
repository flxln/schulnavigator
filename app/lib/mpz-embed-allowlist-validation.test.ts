import { describe, expect, it } from 'vitest'
import {
  isValidEmbedSuffix,
  validateEmbedAllowlistContent,
} from '@/lib/mpz-embed-allowlist-validation'

describe('validateEmbedAllowlistContent', () => {
  it('akzeptiert gültige Datei', () => {
    expect(
      validateEmbedAllowlistContent({
        suffixes: ['delightex.com', 'bookcreator.com'],
      }),
    ).toEqual([])
  })

  it('lehnt leeres Array ab', () => {
    expect(validateEmbedAllowlistContent({ suffixes: [] }).length).toBeGreaterThan(0)
  })

  it('lehnt ungültige Suffixe ab', () => {
    const errors = validateEmbedAllowlistContent({
      suffixes: ['not-a-valid-suffix'],
    })
    expect(errors.some((e) => e.includes('kein gültiges Domain-Suffix'))).toBe(true)
  })

  it('lehnt Duplikate ab', () => {
    const errors = validateEmbedAllowlistContent({
      suffixes: ['delightex.com', 'Delightex.com'],
    })
    expect(errors.some((e) => e.includes('doppeltes Suffix'))).toBe(true)
  })
})

describe('isValidEmbedSuffix', () => {
  it('akzeptiert gültige Domain-Suffixe', () => {
    expect(isValidEmbedSuffix('delightex.com')).toBe(true)
    expect(isValidEmbedSuffix('read.bookcreator.com')).toBe(true)
  })

  it('lehnt Pfade und Protokolle ab', () => {
    expect(isValidEmbedSuffix('https://evil.com')).toBe(false)
    expect(isValidEmbedSuffix('evil.com/path')).toBe(false)
  })
})
