export type EntryMode = 'fest' | 'heft'

export const ACCESS_COOKIE = 'sn_access'

export type AccessToken = {
  token: string
  mode: EntryMode
  expiresAt: string
}

export const ACCESS_TOKENS: readonly AccessToken[] = [
  { token: 'fest-2026', mode: 'fest', expiresAt: '2026-07-31' },
  { token: 'heft-2026-27', mode: 'heft', expiresAt: '2027-07-31' },
]

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
  const hit = ACCESS_TOKENS.find((t) => t.token === token)
  if (!hit) {
    return null
  }
  if (now > tokenExpiresAtEnd(hit.expiresAt)) {
    return null
  }
  return hit
}
