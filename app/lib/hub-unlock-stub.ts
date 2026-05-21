export type HubUnlockMode = 'all-unlocked' | 'all-locked'

export function getUnlockedSegmentIds(
  mode: HubUnlockMode,
  allSegmentIds: readonly string[],
): ReadonlySet<string> {
  if (mode === 'all-locked') {
    return new Set()
  }
  return new Set(allSegmentIds)
}
