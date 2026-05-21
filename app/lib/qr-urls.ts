/** Schwellwert für Konsolen-Warnung (lange URLs → feinere QR-Module). */
export const DEFAULT_URL_LENGTH_WARN = 120

export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL fehlt oder ist leer. Siehe app/.env.example — Wert in app/.env.local setzen oder per Shell exportieren.',
    )
  }
  return trimmed.replace(/\/+$/, '')
}

export function buildRoomUrl(baseUrl: string, slug: string): string {
  return new URL(
    `/raum/${encodeURIComponent(slug)}`,
    ensureTrailingSlashForBase(baseUrl),
  ).href
}

export function buildEntryUrl(baseUrl: string, token: string): string {
  const u = new URL('/eintritt', ensureTrailingSlashForBase(baseUrl))
  u.searchParams.set('t', token)
  return u.href
}

function ensureTrailingSlashForBase(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

export function warnIfUrlTooLong(
  url: string,
  label: string,
  maxLength: number = DEFAULT_URL_LENGTH_WARN,
): void {
  if (url.length > maxLength) {
    console.warn(
      `[QR] URL für "${label}" ist ${url.length} Zeichen lang (Schwellwert ${maxLength}). Bei kleinem Druck (z. B. 3 cm) die Scanbarkeit prüfen oder --size / QR_PRINT_WIDTH_PX erhöhen.`,
    )
  }
}
