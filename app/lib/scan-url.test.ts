import { describe, expect, it } from 'vitest'
import { FEST_DEV_TOKEN, HEFT_DEV_TOKEN } from '@/lib/access-tokens'
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

  it('akzeptiert gedruckte Produktions-Origin als trusted origin', () => {
    const devOrigin = 'https://192.168.0.136:3000'
    expect(
      parseRoomScan(`${ORIGIN}/raum/musik`, devOrigin, SLUGS, [ORIGIN]),
    ).toBe('musik')
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
      parseEntryScan(`${ORIGIN}/eintritt?t=${FEST_DEV_TOKEN}`, ORIGIN),
    ).toBe(FEST_DEV_TOKEN)
  })

  it('akzeptiert relativen Pfad', () => {
    expect(parseEntryScan(`/eintritt?t=${HEFT_DEV_TOKEN}`, ORIGIN)).toBe(
      HEFT_DEV_TOKEN,
    )
  })

  it('gibt beliebiges t zurück (Membership = Middleware)', () => {
    expect(parseEntryScan(`${ORIGIN}/eintritt?t=quatsch`, ORIGIN)).toBe(
      'quatsch',
    )
  })

  it('ignoriert Fragment und Extra-Query-Params', () => {
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=${FEST_DEV_TOKEN}#x`, ORIGIN),
    ).toBe(FEST_DEV_TOKEN)
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=${FEST_DEV_TOKEN}&reason=invalid`, ORIGIN),
    ).toBe(FEST_DEV_TOKEN)
  })

  it('lehnt Fremd-Origin ab', () => {
    expect(
      parseEntryScan(`https://evil.example/eintritt?t=${FEST_DEV_TOKEN}`, ORIGIN),
    ).toBeNull()
  })

  it('akzeptiert gedruckte Produktions-Origin als trusted origin', () => {
    const devOrigin = 'https://192.168.0.136:3000'
    expect(
      parseEntryScan(`${ORIGIN}/eintritt?t=${FEST_DEV_TOKEN}`, devOrigin, [ORIGIN]),
    ).toBe(FEST_DEV_TOKEN)
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
