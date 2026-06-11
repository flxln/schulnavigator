import { describe, expect, it } from 'vitest'
import nextConfig from './next.config'

describe('next.config CSP headers', () => {
  it('setzt frame-src mit Delightex Apex und Wildcard', async () => {
    const headersFn = nextConfig.headers
    expect(typeof headersFn).toBe('function')
    const routes = await headersFn!()
    const csp = routes[0]?.headers?.find(
      (h) => h.key === 'Content-Security-Policy',
    )?.value
    expect(csp).toContain("frame-src 'self'")
    expect(csp).toContain('https://*.delightex.com')
    expect(csp).toContain('https://delightex.com')
  })
})
