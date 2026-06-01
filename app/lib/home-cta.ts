import type { EntryMode } from '@/lib/access-tokens'

export type HomeFooterCta = 'fest-split' | 'fest-scan' | 'heft-suggestion' | 'none'

export function getHomeFooterCta(
  mode: EntryMode,
  isHydrated: boolean,
  visitedCount: number,
  total: number,
  hasNext: boolean,
): HomeFooterCta {
  if (total === 0) {
    return mode === 'fest' ? 'fest-scan' : 'none'
  }

  if (mode === 'fest') {
    if (!isHydrated || visitedCount === 0) return 'fest-scan'
    if (!hasNext) return 'none'
    return 'fest-split'
  }

  if (mode === 'heft' && isHydrated && visitedCount > 0 && hasNext) {
    return 'heft-suggestion'
  }

  return 'none'
}
