import { describe, expect, it } from 'vitest'
import nextConfig from './next.config'

describe('next.config CSP headers', () => {
  it('setzt frame-src mit Delightex und Book Creator Apex und Wildcard', async () => {
    const headersFn = nextConfig.headers
    expect(typeof headersFn).toBe('function')
    const routes = await headersFn!()
    const csp = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy',
    )?.value
    expect(csp).toContain("frame-src 'self'")
    expect(csp).toContain('https://*.delightex.com')
    expect(csp).toContain('https://delightex.com')
    expect(csp).toContain('https://*.bookcreator.com')
    expect(csp).toContain('https://bookcreator.com')
  })

  it('setzt frame-ancestors (Default none)', async () => {
    const routes = await nextConfig.headers!()
    const csp = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy',
    )?.value
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('setzt kein X-Frame-Options', async () => {
    const routes = await nextConfig.headers!()
    const xfo = routes[0]?.headers?.find((h) => h.key === 'X-Frame-Options')
    expect(xfo).toBeUndefined()
  })
})
