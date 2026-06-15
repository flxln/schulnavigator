import { externalLinkHostname, isValidHttpsUrl } from './external-link'
import type { Medium } from '@/lib/types'

/** Single Source of Truth — App-Allowlist, Validator-Subset und CSP frame-src. */
export const DEFAULT_EMBED_ALLOW_SUFFIXES = [
  'delightex.com',
  'bookcreator.com',
] as const

export type EmbedAllowSuffix = (typeof DEFAULT_EMBED_ALLOW_SUFFIXES)[number]

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

export function resolveEmbedAllowlist(medium: Pick<Medium, 'embedAllow'>): string[] {
  return medium.embedAllow ?? [...DEFAULT_EMBED_ALLOW_SUFFIXES]
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
): boolean {
  return embedAllow.every((entry) =>
    DEFAULT_EMBED_ALLOW_SUFFIXES.includes(entry as EmbedAllowSuffix),
  )
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
  return embedAllowlistToCspFrameSrc(DEFAULT_EMBED_ALLOW_SUFFIXES)
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
