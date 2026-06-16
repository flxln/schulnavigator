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

  it('setzt X-Content-Type-Options nosniff und Referrer-Policy', async () => {
    const routes = await nextConfig.headers!()
    const headers = routes[0]?.headers ?? []
    expect(headers.find((h) => h.key === 'X-Content-Type-Options')?.value).toBe(
      'nosniff',
    )
    expect(headers.find((h) => h.key === 'Referrer-Policy')?.value).toBe(
      'strict-origin-when-cross-origin',
    )
  })

  it('setzt Report-Only-CSP mit strikter Basis-Policy (beobachtend, nicht erzwungen)', async () => {
    const routes = await nextConfig.headers!()
    const reportOnly = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy-Report-Only',
    )?.value
    expect(reportOnly).toContain("default-src 'self'")
    expect(reportOnly).toContain("object-src 'none'")
    expect(reportOnly).toContain("base-uri 'self'")
    // Frame-Allowlist bleibt konsistent mit der erzwungenen CSP.
    expect(reportOnly).toContain('https://*.delightex.com')
    expect(reportOnly).toContain("frame-ancestors 'none'")
  })
})
