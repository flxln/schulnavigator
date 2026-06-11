import { describe, expect, it } from 'vitest'
import { getHomeFooterCta } from '@/lib/home-cta'

describe('getHomeFooterCta', () => {
  describe('fest', () => {
    it('pre-hydration → fest-scan', () => {
      expect(getHomeFooterCta('fest', false, 5, 11, true)).toBe('fest-scan')
    })

    it('0 besucht → fest-scan', () => {
      expect(getHomeFooterCta('fest', true, 0, 11, true)).toBe('fest-scan')
    })

    it('1–10 mit next → scan-next', () => {
      expect(getHomeFooterCta('fest', true, 3, 11, true)).toBe('scan-next')
    })

    it('11/11 ohne next → none', () => {
      expect(getHomeFooterCta('fest', true, 11, 11, false)).toBe('none')
    })

    it('total 0 → fest-scan', () => {
      expect(getHomeFooterCta('fest', true, 0, 0, false)).toBe('fest-scan')
    })
  })

  describe('heft', () => {
    it('pre-hydration → none', () => {
      expect(getHomeFooterCta('heft', false, 2, 11, true)).toBe('none')
    })

    it('0 besucht → none', () => {
      expect(getHomeFooterCta('heft', true, 0, 11, true)).toBe('none')
    })

    it('1–10 mit next → scan-next', () => {
      expect(getHomeFooterCta('heft', true, 3, 11, true)).toBe('scan-next')
    })

    it('11/11 → none', () => {
      expect(getHomeFooterCta('heft', true, 11, 11, false)).toBe('none')
    })

    it('total 0 → none', () => {
      expect(getHomeFooterCta('heft', true, 0, 0, false)).toBe('none')
    })
  })
})
