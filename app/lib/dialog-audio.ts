import { join } from 'node:path'

export const DIALOG_CLIP_RE = /^\d{2}-(frieda|otto|beide)\.wav$/

export function dialogAudioFilePath(slug: string, clip: string): string {
  return join(process.cwd(), 'content', 'dialog-audio', slug, clip)
}

export function parseDialogApiPath(
  pathname: string,
): { slug: string; clip: string } | null {
  const match = pathname.match(
    /^\/api\/dialog\/([a-z0-9]+(-[a-z0-9]+)*)\/([^/]+)$/,
  )
  if (!match) {
    return null
  }
  const slug = match[1]
  const clip = match[3]
  if (!slug || !clip || !DIALOG_CLIP_RE.test(clip)) {
    return null
  }
  return { slug, clip }
}
