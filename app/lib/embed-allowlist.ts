import embedAllowlistData from '../data/embed-allowlist.json'
import {
  validateEmbedAllowlistContent,
  type EmbedAllowlistFile,
} from './mpz-embed-allowlist-validation'
import { externalLinkHostname, isValidHttpsUrl } from './external-link'
import type { Medium } from '@/lib/types'

export const FALLBACK_EMBED_ALLOW_SUFFIXES = [
  'delightex.com',
  'bookcreator.com',
] as const

function parseLoadedAllowlist(raw: unknown): readonly string[] {
  const errors = validateEmbedAllowlistContent(raw)
  if (errors.length > 0) {
    return [...FALLBACK_EMBED_ALLOW_SUFFIXES]
  }
  const file = raw as EmbedAllowlistFile
  return [...file.suffixes].map((s) => s.trim().toLowerCase()).sort()
}

let cachedSuffixes: readonly string[] | null = null

export function getEmbedAllowSuffixes(): readonly string[] {
  if (cachedSuffixes === null) {
    cachedSuffixes = parseLoadedAllowlist(embedAllowlistData)
  }
  return cachedSuffixes
}

/** @deprecated Nutze getEmbedAllowSuffixes() — Alias für Abwärtskompatibilität in Tests. */
export const DEFAULT_EMBED_ALLOW_SUFFIXES = getEmbedAllowSuffixes()

export function hostMatchesEmbedAllowlist(
  hostname: string,
  suffixes: readonly string[],
): boolean {
  const host = hostname.toLowerCase()
  return suffixes.some((suffix) => {
    const s = suffix.toLowerCase()
    return host === s || host.endsWith(`.${s}`)
  })
}

export function resolveEmbedAllowlist(
  medium: Pick<Medium, 'embedAllow'>,
  suffixes: readonly string[] = getEmbedAllowSuffixes(),
): string[] {
  return medium.embedAllow ?? [...suffixes]
}

export function isEmbedUrlAllowed(
  url: string,
  suffixes: readonly string[],
): boolean {
  if (!isValidHttpsUrl(url)) {
    return false
  }
  try {
    const host = new URL(url).hostname
    return hostMatchesEmbedAllowlist(host, suffixes)
  } catch {
    return false
  }
}

export function isEmbedAllowSubset(
  embedAllow: readonly string[],
  suffixes: readonly string[] = getEmbedAllowSuffixes(),
): boolean {
  const global = new Set(suffixes.map((s) => s.toLowerCase()))
  return embedAllow.every((entry) => global.has(entry.toLowerCase()))
}

/** CSP frame-src hosts derived from suffix list (apex + wildcard per suffix). */
export function embedAllowlistToCspFrameSrc(suffixes: readonly string[]): string {
  const parts = suffixes.flatMap((suffix) => [
    `https://*.${suffix}`,
    `https://${suffix}`,
  ])
  return parts.join(' ')
}

export function defaultEmbedCspFrameSrc(): string {
  return embedAllowlistToCspFrameSrc(getEmbedAllowSuffixes())
}

/** Delightex 3D-Welt braucht Scripts im Frame; allow-same-origin schwächt Sandbox — bewusst für cross-origin-Embed. */
export const DEFAULT_EMBED_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-forms'

export function isEmbedEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EMBED_ENABLED === 'true'
}

export function isBookCreatorUrl(url: string): boolean {
  const host = externalLinkHostname(url)
  return host !== null && hostMatchesEmbedAllowlist(host, ['bookcreator.com'])
}

/** Nur für Tests: Cache nach JSON-Schreibvorgang zurücksetzen. */
export function resetEmbedAllowSuffixesCacheForTests(): void {
  cachedSuffixes = null
}
