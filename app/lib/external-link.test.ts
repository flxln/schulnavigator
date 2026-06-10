import { describe, expect, it } from 'vitest'
import { isValidHttpsUrl } from '@/lib/external-link'

describe('isValidHttpsUrl', () => {
  it('akzeptiert gültige https-URL', () => {
    expect(isValidHttpsUrl('https://edu.delightex.com/share/abc')).toBe(true)
    expect(isValidHttpsUrl('https://example.com')).toBe(true)
  })

  it('lehnt http ab', () => {
    expect(isValidHttpsUrl('http://example.com')).toBe(false)
  })

  it('lehnt lokale Pfade ab', () => {
    expect(isValidHttpsUrl('/media/foo.mp4')).toBe(false)
  })

  it('lehnt javascript ab', () => {
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false)
  })

  it('lehnt malformed URLs ab', () => {
    expect(isValidHttpsUrl('https://')).toBe(false)
    expect(isValidHttpsUrl('not-a-url')).toBe(false)
    expect(isValidHttpsUrl('')).toBe(false)
  })
})
