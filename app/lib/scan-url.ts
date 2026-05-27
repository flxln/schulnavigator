const ROOM_PATH = /^\/raum\/([^/]+)$/

function isAllowedScanOrigin(
  scanned: URL,
  appOrigin: string,
  trustedOrigins: readonly string[],
): boolean {
  const allowed = new Set<string>([new URL(appOrigin).origin])
  for (const trusted of trustedOrigins) {
    try {
      allowed.add(new URL(trusted).origin)
    } catch {
      // Ungültige trusted origin ignorieren
    }
  }
  return allowed.has(scanned.origin)
}

export function parseEntryScan(
  raw: string,
  origin: string,
  trustedOrigins: readonly string[] = [],
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

  if (!isAllowedScanOrigin(url, origin, trustedOrigins)) {
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
  trustedOrigins: readonly string[] = [],
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

  if (!isAllowedScanOrigin(url, origin, trustedOrigins)) {
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
