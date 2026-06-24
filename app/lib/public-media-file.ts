import { extname, join, normalize } from 'node:path'
import { getStationsPaths } from '@/lib/mpz-content-io'

const MEDIA_SEGMENT_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.heic': 'image/heic',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

export function isSafePublicMediaSegment(segment: string): boolean {
  return MEDIA_SEGMENT_RE.test(segment)
}

export function resolvePublicMediaFilePath(segments: string[]): string | null {
  if (segments.length === 0 || segments.some((segment) => !isSafePublicMediaSegment(segment))) {
    return null
  }

  const { appRoot } = getStationsPaths()
  const mediaRoot = normalize(join(appRoot, 'public', 'media'))
  const candidate = normalize(join(mediaRoot, ...segments))
  const prefix = `${mediaRoot}/`

  if (candidate !== mediaRoot && !candidate.startsWith(prefix)) {
    return null
  }

  return candidate
}

export function publicMediaContentType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  return CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream'
}
