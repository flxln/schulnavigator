import type { EntryMode } from '@/lib/access-tokens'

export function getUnlockedSegmentIdsForMode(
  mode: EntryMode,
  allSegmentIds: readonly string[],
): ReadonlySet<string> {
  if (mode === 'heft') {
    return new Set(allSegmentIds)
  }
  return new Set()
}
