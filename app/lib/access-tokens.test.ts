import { afterEach, describe, expect, it, vi } from 'vitest'
import { ENTRY_QRS } from '../scripts/qr-config.mjs'
import {
  DEV_FALLBACK_TOKENS,
  FEST_DEV_TOKEN,
  getAccessTokens,
  HEFT_DEV_TOKEN,
  maxAgeSeconds,
  parseAccessTokensJson,
  resetAccessTokensCacheForTests,
  validateToken,
} from '@/lib/access-tokens'

describe('validateToken', () => {
  afterEach(() => {
    resetAccessTokensCacheForTests()
  })

  it('liefert Modus für gültigen fest-Token', () => {
    const hit = validateToken(FEST_DEV_TOKEN, new Date('2026-06-01'))
    expect(hit?.mode).toBe('fest')
    expect(hit?.token).toBe(FEST_DEV_TOKEN)
  })

  it('liefert Modus für gültigen heft-Token', () => {
    const hit = validateToken(HEFT_DEV_TOKEN, new Date('2026-09-01'))
    expect(hit?.mode).toBe('heft')
  })

  it('lehnt unbekannten Token ab', () => {
    expect(validateToken('quatsch')).toBeNull()
  })

  it('lehnt abgelaufenen Token ab', () => {
    expect(
      validateToken(FEST_DEV_TOKEN, new Date('2026-08-01T00:00:00.000Z')),
    ).toBeNull()
  })

  it('akzeptiert Token bis Ende des Ablauftags', () => {
    expect(
      validateToken(FEST_DEV_TOKEN, new Date('2026-07-31T12:00:00.000Z')),
    ).not.toBeNull()
  })

  it('lehnt leer/undefined ab', () => {
    expect(validateToken('')).toBeNull()
    expect(validateToken(undefined)).toBeNull()
    expect(validateToken(null)).toBeNull()
  })
})

describe('maxAgeSeconds', () => {
  it('ist nicht negativ', () => {
    expect(
      maxAgeSeconds('2020-01-01', new Date('2026-01-01')),
    ).toBe(0)
  })
})

describe('parseAccessTokensJson', () => {
  it('parst gültiges JSON-Array', () => {
    const tokens = parseAccessTokensJson(
      JSON.stringify([
        { token: 'a', mode: 'fest', expiresAt: '2026-12-31' },
      ]),
    )
    expect(tokens).toHaveLength(1)
    expect(tokens[0]?.mode).toBe('fest')
  })

  it('wirft bei ungültigem mode', () => {
    expect(() =>
      parseAccessTokensJson(
        JSON.stringify([{ token: 'a', mode: 'x', expiresAt: '2026-12-31' }]),
      ),
    ).toThrow(/mode/)
  })
})

describe('getAccessTokens in Production', () => {
  const envSnapshot = { ...process.env }

  afterEach(() => {
    vi.unstubAllEnvs()
    process.env = { ...envSnapshot }
    resetAccessTokensCacheForTests()
  })

  it('liefert leere Liste ohne SN_ACCESS_TOKENS', () => {
    vi.stubEnv('NODE_ENV', 'production')
    delete process.env.SN_ACCESS_TOKENS
    resetAccessTokensCacheForTests()
    expect(getAccessTokens()).toEqual([])
  })

  it('lädt Tokens aus SN_ACCESS_TOKENS', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv(
      'SN_ACCESS_TOKENS',
      JSON.stringify([
        { token: 'prod-fest', mode: 'fest', expiresAt: '2026-12-31' },
      ]),
    )
    resetAccessTokensCacheForTests()
    expect(getAccessTokens()[0]?.token).toBe('prod-fest')
  })
})

describe('DEV_FALLBACK_TOKENS sync mit qr-config.mjs', () => {
  it('hat dieselben Token-Strings wie ENTRY_QRS', () => {
    const fromLib = DEV_FALLBACK_TOKENS.map((t) => t.token).sort()
    const fromQr = ENTRY_QRS.map((e) => e.token).sort()
    expect(fromLib).toEqual(fromQr)
  })

  it('hat dieselben Modi wie ENTRY_QRS', () => {
    for (const entry of ENTRY_QRS) {
      const hit = DEV_FALLBACK_TOKENS.find((t) => t.token === entry.token)
      expect(hit?.mode).toBe(entry.mode)
    }
  })
})
