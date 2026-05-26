import type { EntryMode } from '@/lib/access-tokens'

export type HubSegmentRef = {
  slug: string
  puzzleSegmentId: string
}

export function getUnlockedSegmentIdsForMode(
  mode: EntryMode,
  segments: readonly HubSegmentRef[],
  visitedSlugs: ReadonlySet<string>,
): ReadonlySet<string> {
  if (mode === 'heft') {
    return new Set(segments.map((s) => s.puzzleSegmentId))
  }
  const unlocked = new Set<string>()
  for (const segment of segments) {
    if (visitedSlugs.has(segment.slug)) {
      unlocked.add(segment.puzzleSegmentId)
    }
  }
  return unlocked
}
