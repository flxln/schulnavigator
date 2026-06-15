import { ENTRY_QR_SPECS } from '../lib/access-token-constants.mjs'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const HTTPS_ORIGIN_RE = /^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/

export function parseAccessMode(raw) {
  return raw === 'open' ? 'open' : 'gated'
}

export function parseAccessTokenEntry(entry, index) {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`SN_ACCESS_TOKENS[${index}]: Eintrag muss ein Objekt sein`)
  }
  const { token, mode, expiresAt } = entry
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error(`SN_ACCESS_TOKENS[${index}]: token muss ein nicht-leerer String sein`)
  }
  if (mode !== 'fest' && mode !== 'heft') {
    throw new Error(`SN_ACCESS_TOKENS[${index}]: mode muss fest oder heft sein`)
  }
  if (typeof expiresAt !== 'string' || !ISO_DATE_RE.test(expiresAt)) {
    throw new Error(
      `SN_ACCESS_TOKENS[${index}]: expiresAt muss ISO-Datum YYYY-MM-DD sein`,
    )
  }
  return { token: token.trim(), mode, expiresAt }
}

export function parseAccessTokensJson(raw) {
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('SN_ACCESS_TOKENS: ungültiges JSON')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('SN_ACCESS_TOKENS: muss ein JSON-Array sein')
  }
  return parsed.map((entry, index) => parseAccessTokenEntry(entry, index))
}

export function parseEmbedAncestors(raw) {
  if (!raw?.trim()) {
    return []
  }
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const normalized = []
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

export function assertEntryQrSync(tokens, specs = ENTRY_QR_SPECS) {
  for (const spec of specs) {
    const hit = tokens.find((t) => t.token === spec.token)
    if (!hit) {
      throw new Error(
        `SN_ACCESS_TOKENS: Entry-QR-Token "${spec.token}" (${spec.file}) fehlt — gedruckte QRs würden ins Leere zeigen`,
      )
    }
    if (hit.mode !== spec.mode) {
      throw new Error(
        `SN_ACCESS_TOKENS: Token "${spec.token}" hat mode "${hit.mode}", erwartet "${spec.mode}" (${spec.file})`,
      )
    }
  }
}
