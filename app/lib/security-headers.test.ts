import { describe, expect, it } from 'vitest'
import {
  buildContentSecurityPolicy,
  buildFrameSrcDirective,
  buildPermissionsPolicy,
} from '@/lib/security-headers'

describe('security-headers', () => {
  it('buildContentSecurityPolicy enthält Kern-Direktiven (#143)', () => {
    const csp = buildContentSecurityPolicy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("worker-src 'self' blob:")
    expect(csp).toContain("img-src 'self' data: blob:")
  })

  it('buildFrameSrcDirective enthält Embed-Allowlist', () => {
    const frameSrc = buildFrameSrcDirective()
    expect(frameSrc).toContain("frame-src 'self'")
    expect(frameSrc).toContain('https://*.delightex.com')
    expect(frameSrc).toContain('https://*.bookcreator.com')
  })

  it('buildContentSecurityPolicy enthält frame-ancestors', () => {
    const csp = buildContentSecurityPolicy()
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('buildPermissionsPolicy erlaubt Kamera und Orientierung für self', () => {
    const pp = buildPermissionsPolicy()
    expect(pp).toContain('camera=(self)')
    expect(pp).toContain('gyroscope=(self)')
    expect(pp).toContain('accelerometer=(self)')
    expect(pp).toContain('magnetometer=(self)')
  })
})
