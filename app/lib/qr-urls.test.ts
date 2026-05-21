import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildEntryUrl,
  buildRoomUrl,
  DEFAULT_URL_LENGTH_WARN,
  normalizeBaseUrl,
  warnIfUrlTooLong,
} from '@/lib/qr-urls'

describe('normalizeBaseUrl', () => {
  it('trimmt und entfernt trailing slashes', () => {
    expect(normalizeBaseUrl('  https://beispiel.de/  ')).toBe(
      'https://beispiel.de',
    )
    expect(normalizeBaseUrl('http://localhost:3000///')).toBe(
      'http://localhost:3000',
    )
  })

  it('wirft bei leerem String', () => {
    expect(() => normalizeBaseUrl('')).toThrow(/NEXT_PUBLIC_BASE_URL/)
    expect(() => normalizeBaseUrl('   ')).toThrow(/NEXT_PUBLIC_BASE_URL/)
  })
})

describe('buildRoomUrl', () => {
  it('baut Raum-URL mit längstem Slug schulsozialarbeit', () => {
    const base = 'https://schule.example.de'
    expect(buildRoomUrl(base, 'schulsozialarbeit')).toBe(
      'https://schule.example.de/raum/schulsozialarbeit',
    )
  })

  it('baut Raum-URL für localhost', () => {
    expect(buildRoomUrl('http://localhost:3000', 'musik')).toBe(
      'http://localhost:3000/raum/musik',
    )
  })
})

describe('buildEntryUrl', () => {
  it('setzt Query-Parameter t', () => {
    expect(buildEntryUrl('https://schule.example.de', 'fest-2026')).toBe(
      'https://schule.example.de/eintritt?t=fest-2026',
    )
  })
})

describe('warnIfUrlTooLong', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warnt wenn URL länger als Schwellwert', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const longBase = `https://${'x'.repeat(100)}.example.de`
    const url = buildRoomUrl(longBase, 'musik')
    warnIfUrlTooLong(url, 'test-raum', 50)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/test-raum/)
  })

  it('warnt nicht bei kurzer URL', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnIfUrlTooLong(
      buildRoomUrl('https://a.de', 'musik'),
      'musik',
      DEFAULT_URL_LENGTH_WARN,
    )
    expect(warn).not.toHaveBeenCalled()
  })
})
