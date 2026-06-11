import { externalLinkHostname } from './external-link'

const DELIGHTEX_SUFFIX = 'delightex.com'

export const DELIGHTEX_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=delightex.cospaces.edu'

export const DELIGHTEX_APP_STORE_URL =
  'https://apps.apple.com/app/delightex-edu/id1224622426'

export function isDelightexHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === DELIGHTEX_SUFFIX || host.endsWith(`.${DELIGHTEX_SUFFIX}`)
}

export function isDelightexUrl(url: string): boolean {
  const host = externalLinkHostname(url)
  return host !== null && isDelightexHost(host)
}

/** Gibt den plattformspezifischen Store-Link zurück, oder null wenn unbekannt. */
export function getDelightexStoreUrl(): string | null {
  if (typeof navigator === 'undefined') {
    return null
  }
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) {
    return DELIGHTEX_APP_STORE_URL
  }
  if (/android/.test(ua)) {
    return DELIGHTEX_PLAY_STORE_URL
  }
  return null
}

/**
 * True auf Touch-Geräten (Smartphones/Tablets).
 * Basiert auf `pointer: coarse` — robust genug für den Schulfest-Kontext.
 * Client-only: immer false auf dem Server.
 */
export function shouldSkipEmbedIframe(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(pointer: coarse)').matches
}
