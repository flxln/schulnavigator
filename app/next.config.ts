import type { NextConfig } from 'next'
import { defaultEmbedCspFrameSrc } from './lib/embed-allowlist'
import { defaultFrameAncestorsCsp } from './lib/frame-ancestors'

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const contentSecurityPolicy = `frame-src 'self' ${defaultEmbedCspFrameSrc()}; frame-ancestors ${defaultFrameAncestorsCsp()}`

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
        ],
      },
    ]
  },
}

export default nextConfig
