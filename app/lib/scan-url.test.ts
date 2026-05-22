import { describe, expect, it } from 'vitest'
import { parseRoomScan } from '@/lib/scan-url'

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
