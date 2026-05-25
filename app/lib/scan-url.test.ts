import { describe, expect, it } from 'vitest'
import { parseEntryScan, parseRoomScan } from '@/lib/scan-url'

const ORIGIN = 'https://schulnavigator.mpz.schule'
const SLUGS = ['musik', 'schulsozialarbeit'] as const

describe('parseRoomScan', () => {
  it('akzeptiert same-origin Raum-URL', () => {
    expect(
      parseRoomScan(`${ORIGIN}/raum/musik`, ORIGIN, SLUGS),
    ).toBe('musik')
  })

  it('akzeptiert relativen Pfad', () => {
    expect(parseRoomScan('/raum/musik', ORIGIN, SLUGS)).toBe('musik')
  })

  it('lehnt Fremd-Origin ab', () => {
    expect(
      parseRoomScan('https://evil.example/raum/musik', ORIGIN, SLUGS),
    ).toBeNull()
  })

  it('lehnt unbekannten Slug ab', () => {
    expect(parseRoomScan(`${ORIGIN}/raum/xyz`, ORIGIN, SLUGS)).toBeNull()
  })

  it('lehnt andere Pfade ab', () => {
    expect(parseRoomScan(`${ORIGIN}/scan`, ORIGIN, SLUGS)).toBeNull()
    expect(parseRoomScan(`${ORIGIN}/raum/musik/extra`, ORIGIN, SLUGS)).toBeNull()
  })

  it('lehnt leeren String ab', () => {
    expect(parseRoomScan('', ORIGIN, SLUGS)).toBeNull()
  })
})

describe('parseEntryScan', () => {
  it('akzeptiert volle Entry-URL', () => {
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=fest-2026`, ORIGIN),
    ).toBe('fest-2026')
  })

  it('akzeptiert relativen Pfad', () => {
    expect(parseEntryScan('/eintritt?t=heft-2026-27', ORIGIN)).toBe(
      'heft-2026-27',
    )
  })

  it('gibt beliebiges t zurück (Membership = Middleware)', () => {
    expect(parseEntryScan(`${ORIGIN}/eintritt?t=quatsch`, ORIGIN)).toBe(
      'quatsch',
    )
  })

  it('ignoriert Fragment und Extra-Query-Params', () => {
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=fest-2026#x`, ORIGIN),
    ).toBe('fest-2026')
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=fest-2026&reason=invalid`, ORIGIN),
    ).toBe('fest-2026')
  })

  it('lehnt Fremd-Origin ab', () => {
    expect(
      parseEntryScan('https://evil.example/eintritt?t=fest-2026', ORIGIN),
    ).toBeNull()
  })

  it('lehnt Raum-URL ab', () => {
    expect(parseEntryScan(`${ORIGIN}/raum/musik`, ORIGIN)).toBeNull()
  })

  it('lehnt /eintritt ohne t ab', () => {
    expect(parseEntryScan(`${ORIGIN}/eintritt`, ORIGIN)).toBeNull()
    expect(parseEntryScan(`${ORIGIN}/eintritt?t=`, ORIGIN)).toBeNull()
  })

  it('lehnt leeren String ab', () => {
    expect(parseEntryScan('', ORIGIN)).toBeNull()
  })
})
