import type { DialogRolle } from '@/lib/types'

export const DIALOG_CLIP_RE = /^\d{2}-(frieda|otto|beide)\.wav$/

export function buildClipName(segmentIndex: number, rolle: DialogRolle): string {
  if (!Number.isInteger(segmentIndex) || segmentIndex < 0 || segmentIndex > 98) {
    throw new Error(`segmentIndex muss eine Ganzzahl 0–98 sein, erhalten: ${segmentIndex}`)
  }
  const clip = `${String(segmentIndex + 1).padStart(2, '0')}-${rolle}.wav`
  if (!DIALOG_CLIP_RE.test(clip)) {
    throw new Error(`Ungültiger Clip-Name: ${clip}`)
  }
  return clip
}

export function dialogApiQuelle(slug: string, clip: string): string {
  return `/api/dialog/${slug}/${clip}`
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
