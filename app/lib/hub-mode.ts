import type { EntryMode } from '@/lib/access-tokens'

/**
 * Slugs, die vom Hub aus geöffnet werden dürfen (ADR-009).
 * heft: alle Stationen; fest: nur besuchte (`sn_visited_slugs`).
 */
export function getUnlockedSlugsForMode(
  mode: EntryMode,
  stationSlugs: readonly string[],
  visitedSlugs: ReadonlySet<string>,
): ReadonlySet<string> {
  if (mode === 'heft') {
    return new Set(stationSlugs)
  }
  const unlocked = new Set<string>()
  for (const slug of stationSlugs) {
    if (visitedSlugs.has(slug)) {
      unlocked.add(slug)
    }
  }
  return unlocked
}

export function isHubStationNavigable(
  slug: string,
  unlockedSlugs: ReadonlySet<string>,
): boolean {
  return unlockedSlugs.has(slug)
}

export function isHubFullyLocked(
  mode: EntryMode,
  unlockedSlugs: ReadonlySet<string>,
  stationCount: number,
): boolean {
  return mode === 'fest' && stationCount > 0 && unlockedSlugs.size === 0
}

export function getHubStationTapHref(
  slug: string,
  mode: EntryMode,
  unlockedSlugs: ReadonlySet<string>,
): string {
  if (mode === 'fest' && !isHubStationNavigable(slug, unlockedSlugs)) {
    return '/scan'
  }
  return `/raum/${slug}`
}
