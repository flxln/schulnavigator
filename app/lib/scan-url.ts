const ROOM_PATH = /^\/raum\/([^/]+)$/

export function parseEntryScan(raw: string, origin: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  let url: URL
  try {
    url = new URL(trimmed, origin)
  } catch {
    return null
  }

  const base = new URL(origin)
  if (url.origin !== base.origin) {
    return null
  }

  if (url.pathname !== '/eintritt') {
    return null
  }

  const token = url.searchParams.get('t')?.trim()
  if (!token) {
    return null
  }

  return token
}

export function parseRoomScan(
  raw: string,
  origin: string,
  slugs: readonly string[],
): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  let url: URL
  try {
    url = new URL(trimmed, origin)
  } catch {
    return null
  }

  const base = new URL(origin)
  if (url.origin !== base.origin) {
    return null
  }

  const match = ROOM_PATH.exec(url.pathname)
  if (!match) {
    return null
  }

  const slug = match[1]
  if (!slug || !slugs.includes(slug)) {
    return null
  }

  return slug
}
