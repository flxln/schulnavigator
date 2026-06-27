import {
  ENTRY_QR_SPECS,
  FEST_DEV_EXPIRES_AT,
  HEFT_DEV_EXPIRES_AT,
} from './access-token-constants.mjs'

export type EntryMode = 'fest' | 'heft'

export const ACCESS_COOKIE = 'sn_access'

export type AccessToken = {
  token: string
  mode: EntryMode
  expiresAt: string
}

export { FEST_DEV_TOKEN, HEFT_DEV_TOKEN } from './access-token-constants.mjs'

function expiresAtForEntryToken(token: string): string {
  const spec = ENTRY_QR_SPECS.find((e) => e.token === token)
  if (!spec) {
    throw new Error(`Unbekannter Entry-Token: ${token}`)
  }
  return spec.file === 'entry-fest.png'
    ? FEST_DEV_EXPIRES_AT
    : HEFT_DEV_EXPIRES_AT
}

export const DEV_FALLBACK_TOKENS: readonly AccessToken[] = ENTRY_QR_SPECS.map(
  (spec) => ({
    token: spec.token,
    mode: spec.mode,
    expiresAt: expiresAtForEntryToken(spec.token),
  }),
)

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function parseAccessTokenEntry(entry: unknown, index: number): AccessToken {
  if (!entry || typeof entry !== 'object') {
    throw new Error(`SN_ACCESS_TOKENS[${index}]: Eintrag muss ein Objekt sein`)
  }
  const row = entry as Record<string, unknown>
  const token = row.token
  const mode = row.mode
  const expiresAt = row.expiresAt

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

export function parseAccessTokensJson(raw: string): AccessToken[] {
  let parsed: unknown
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

let cachedTokens: readonly AccessToken[] | undefined

export function resetAccessTokensCacheForTests(): void {
  cachedTokens = undefined
}

export function getAccessTokens(): readonly AccessToken[] {
  if (cachedTokens !== undefined) {
    return cachedTokens
  }

  if (process.env.NODE_ENV === 'production') {
    const raw = process.env.SN_ACCESS_TOKENS?.trim()
    if (!raw) {
      cachedTokens = []
      return cachedTokens
    }
    try {
      cachedTokens = parseAccessTokensJson(raw)
    } catch {
      cachedTokens = []
    }
    return cachedTokens
  }

  cachedTokens = DEV_FALLBACK_TOKENS
  return cachedTokens
}

export function tokenExpiresAtEnd(expiresAt: string): Date {
  return new Date(`${expiresAt}T23:59:59.999Z`)
}

export function maxAgeSeconds(expiresAt: string, now: Date = new Date()): number {
  const ms = tokenExpiresAtEnd(expiresAt).getTime() - now.getTime()
  return Math.max(0, Math.floor(ms / 1000))
}

export function validateToken(
  token: string | undefined | null,
  now: Date = new Date(),
): AccessToken | null {
  if (!token) {
    return null
  }
  const hit = getAccessTokens().find((t) => t.token === token)
  if (!hit) {
    return null
  }
  if (now > tokenExpiresAtEnd(hit.expiresAt)) {
    return null
  }
  return hit
}

/** Entry-QR-Spezifikation für Runtime-Sync (Production ENV ↔ gedruckte QRs). */
export const ENTRY_QR_TOKEN_SPECS = ENTRY_QR_SPECS
