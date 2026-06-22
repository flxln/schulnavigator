import type { NextConfig } from 'next'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildContentSecurityPolicy,
  buildPermissionsPolicy,
} from './lib/security-headers'

// next.config.ts wird als CJS kompiliert, daher ist __dirname verfügbar.
// Der fileURLToPath-Fallback sichert ESM-Kompatibilität für künftige Migrationen.
const projectRoot =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    // Expliziter Root verhindert, dass Turbopack wegen des package-lock.json
    // im Elternverzeichnis (schulnavigator/) fälschlicherweise dessen Root wählt
    // und CSS-Imports (z. B. ./gs39-tokens.css) vom falschen Basisverzeichnis
    // auflöst.
    root: projectRoot,
  },
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  async redirects() {
    return [
      {
        source: '/mpz/studio/hub',
        destination: '/mpz/studio/design?tab=hub',
        permanent: true,
      },
      {
        source: '/mpz/studio/brand',
        destination: '/mpz/studio/design?tab=brand',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildContentSecurityPolicy(),
          },
          {
            key: 'Permissions-Policy',
            value: buildPermissionsPolicy(),
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
