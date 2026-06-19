export type EmbedAllowlistFile = {
  suffixes: string[]
}

/** Hostname-Suffix: mind. ein Punkt, nur Kleinbuchstaben, Ziffern, Bindestrich, Punkt. */
export const EMBED_SUFFIX_RE = /^[a-z0-9]([a-z0-9-]*\.)+[a-z0-9-]+$/

export function isValidEmbedSuffix(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) {
    return false
  }
  if (trimmed.includes('/') || trimmed.includes(':') || /\s/.test(trimmed)) {
    return false
  }
  return EMBED_SUFFIX_RE.test(trimmed.toLowerCase())
}

export function validateEmbedAllowlistContent(raw: unknown): string[] {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    errors.push('embed-allowlist.json: Root muss ein Objekt sein')
    return errors
  }

  const file = raw as EmbedAllowlistFile
  if (!Array.isArray(file.suffixes)) {
    errors.push('embed-allowlist.json: suffixes muss ein Array sein')
    return errors
  }

  if (file.suffixes.length === 0) {
    errors.push('embed-allowlist.json: suffixes darf nicht leer sein')
    return errors
  }

  const seen = new Set<string>()
  for (const [index, entry] of file.suffixes.entries()) {
    if (typeof entry !== 'string') {
      errors.push(`embed-allowlist.json: suffixes[${index}] muss ein String sein`)
      continue
    }
    if (!isValidEmbedSuffix(entry)) {
      errors.push(
        `embed-allowlist.json: suffixes[${index}] "${entry}" ist kein gültiges Domain-Suffix`,
      )
      continue
    }
    const normalized = entry.trim().toLowerCase()
    if (seen.has(normalized)) {
      errors.push(
        `embed-allowlist.json: doppeltes Suffix "${normalized}"`,
      )
    } else {
      seen.add(normalized)
    }
  }

  return errors
}
