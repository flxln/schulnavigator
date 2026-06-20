import { defaultEmbedCspFrameSrc } from './embed-allowlist'
import { defaultFrameAncestorsCsp } from './frame-ancestors'

export function buildFrameSrcDirective(): string {
  return `frame-src 'self' ${defaultEmbedCspFrameSrc()}`
}

/**
 * Erzwungene CSP (#143). `unsafe-inline` für script/style bleibt nötig (Next.js App Router).
 * `worker-src blob:` für Photo Sphere Viewer; `img-src blob:` für Canvas/Texture-Pfade.
 */
export function buildContentSecurityPolicy(): string {
  const frameSrc = buildFrameSrcDirective()
  const frameAncestors = `frame-ancestors ${defaultFrameAncestorsCsp()}`

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    frameSrc,
    frameAncestors,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

/** QR-Scan + Gyro/Flat/Sphere-Viewer (#143). */
export function buildPermissionsPolicy(): string {
  return [
    'camera=(self)',
    'gyroscope=(self)',
    'accelerometer=(self)',
    'magnetometer=(self)',
  ].join(', ')
}
