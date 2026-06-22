import { describe, expect, it } from 'vitest'
import nextConfig from './next.config'

describe('next.config security headers', () => {
  it('setzt erzwungene CSP mit Embed-Allowlist und Kern-Direktiven (#143)', async () => {
    const headersFn = nextConfig.headers
    expect(typeof headersFn).toBe('function')
    const routes = await headersFn!()
    const csp = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy',
    )?.value
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).toContain("worker-src 'self' blob:")
    expect(csp).toContain("frame-src 'self'")
    expect(csp).toContain('https://*.delightex.com')
    expect(csp).toContain('https://delightex.com')
    expect(csp).toContain('https://*.bookcreator.com')
    expect(csp).toContain('https://bookcreator.com')
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('setzt keine Report-Only-CSP mehr (in Enforcement gemerged)', async () => {
    const routes = await nextConfig.headers!()
    const reportOnly = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy-Report-Only',
    )
    expect(reportOnly).toBeUndefined()
  })

  it('setzt Permissions-Policy für Scan und Gyro', async () => {
    const routes = await nextConfig.headers!()
    const pp = routes[0]?.headers?.find((h) => h.key === 'Permissions-Policy')
      ?.value
    expect(pp).toContain('camera=(self)')
    expect(pp).toContain('gyroscope=(self)')
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
})

describe('next.config redirects', () => {
  it('leitet /mpz/studio/hub permanent auf /mpz/studio/design?tab=hub um (REDIR-01, NAV-03)', async () => {
    const redirectsFn = nextConfig.redirects
    expect(typeof redirectsFn).toBe('function')
    const redirects = await redirectsFn!()
    const hub = redirects.find((r) => r.source === '/mpz/studio/hub')
    expect(hub).toEqual({
      source: '/mpz/studio/hub',
      destination: '/mpz/studio/design?tab=hub',
      permanent: true,
    })
  })

  it('leitet /mpz/studio/brand permanent auf /mpz/studio/design?tab=brand um (REDIR-01, NAV-03)', async () => {
    const redirects = await nextConfig.redirects!()
    const brand = redirects.find((r) => r.source === '/mpz/studio/brand')
    expect(brand).toEqual({
      source: '/mpz/studio/brand',
      destination: '/mpz/studio/design?tab=brand',
      permanent: true,
    })
  })
})
