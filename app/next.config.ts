import type { NextConfig } from 'next'
import { defaultEmbedCspFrameSrc } from './lib/embed-allowlist'
import { defaultFrameAncestorsCsp } from './lib/frame-ancestors'

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const frameSrc = `frame-src 'self' ${defaultEmbedCspFrameSrc()}`
const frameAncestors = `frame-ancestors ${defaultFrameAncestorsCsp()}`

// Enforcement: bewusst minimal (nur Frames), bricht keine Next.js-/PSV-Inline-Scripts.
const contentSecurityPolicy = `${frameSrc}; ${frameAncestors}`

// Report-Only: angestrebte strikte Policy zum Beobachten (loggt Verstöße, blockiert nichts).
// Enforcement erst Post-Fest, sobald die Konsolen-Reports keine echten Treffer mehr zeigen.
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  frameSrc,
  frameAncestors,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicyReportOnly,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
