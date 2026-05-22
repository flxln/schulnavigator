import { describe, expect, it } from 'vitest'
import { ENTRY_QRS } from '../scripts/qr-config.mjs'
import {
  ACCESS_TOKENS,
  maxAgeSeconds,
  validateToken,
} from '@/lib/access-tokens'

describe('validateToken', () => {
  it('liefert Modus für gültigen fest-Token', () => {
    const hit = validateToken('fest-2026', new Date('2026-06-01'))
    expect(hit?.mode).toBe('fest')
    expect(hit?.token).toBe('fest-2026')
  })

  it('liefert Modus für gültigen heft-Token', () => {
    const hit = validateToken('heft-2026-27', new Date('2026-09-01'))
    expect(hit?.mode).toBe('heft')
  })

  it('lehnt unbekannten Token ab', () => {
    expect(validateToken('quatsch')).toBeNull()
  })

  it('lehnt abgelaufenen Token ab', () => {
    expect(
      validateToken('fest-2026', new Date('2026-08-01T00:00:00.000Z')),
    ).toBeNull()
  })

  it('akzeptiert Token bis Ende des Ablauftags', () => {
    expect(
      validateToken('fest-2026', new Date('2026-07-31T12:00:00.000Z')),
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

describe('ACCESS_TOKENS sync mit qr-config.mjs', () => {
  it('hat dieselben Token-Strings wie ENTRY_QRS', () => {
    const fromLib = ACCESS_TOKENS.map((t) => t.token).sort()
    const fromQr = ENTRY_QRS.map((e) => e.token).sort()
    expect(fromLib).toEqual(fromQr)
  })

  it('hat dieselben Modi wie ENTRY_QRS', () => {
    for (const entry of ENTRY_QRS) {
      const hit = ACCESS_TOKENS.find((t) => t.token === entry.token)
      expect(hit?.mode).toBe(entry.mode)
    }
  })
})
