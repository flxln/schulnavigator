const HTTPS_ORIGIN_RE = /^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/

export function parseEmbedAncestors(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return []
  }
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const normalized: string[] = []
  for (const part of parts) {
    if (!HTTPS_ORIGIN_RE.test(part)) {
      throw new Error(
        `SN_EMBED_ANCESTORS: ungültiger Origin "${part}" — nur https://<host> ohne Pfad erlaubt`,
      )
    }
    normalized.push(part.toLowerCase())
  }

  return [...new Set(normalized)].sort()
}

export function embedAncestorsToCsp(origins: readonly string[]): string {
  if (origins.length === 0) {
    return "'none'"
  }
  return origins.join(' ')
}

export function defaultFrameAncestorsCsp(): string {
  return embedAncestorsToCsp(parseEmbedAncestors(process.env.SN_EMBED_ANCESTORS))
}
