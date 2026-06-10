import type { HubStation } from '@/lib/schoolhouse-hub-map'

/**
 * Nächste unbesuchte Station in Hub-Reihenfolge.
 * Optional ab `fromSlug` (Wraparound); unbekannter Slug → erste unbesuchte ab Index 0.
 */
export function getNextStation(
  stations: readonly HubStation[],
  visitedSlugs: ReadonlySet<string>,
  fromSlug?: string,
): HubStation | null {
  if (stations.length === 0) return null

  const startIdx = fromSlug
    ? stations.findIndex((s) => s.slug === fromSlug)
    : -1

  for (let i = 1; i <= stations.length; i++) {
    const idx =
      (((startIdx + i) % stations.length) + stations.length) % stations.length
    const cand = stations[idx]
    if (!cand || visitedSlugs.has(cand.slug)) continue
    if (fromSlug !== undefined && cand.slug === fromSlug) continue
    return cand
  }

  return null
}
