'use client'

import { useVisitedStations } from '@/hooks/use-visited-stations'

type StationVisitedBadgeProps = {
  slug: string
  validSlugs: readonly string[]
}

export function StationVisitedBadge({
  slug,
  validSlugs,
}: StationVisitedBadgeProps) {
  const { visitedSlugs, isHydrated } = useVisitedStations(validSlugs)

  const show = isHydrated && visitedSlugs.has(slug)
  if (!show) {
    return null
  }

  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full bg-brand-green-300/25 px-2.5 py-0.5 text-xs font-semibold text-accent"
      aria-label="Station besucht"
    >
      Besucht
    </span>
  )
}
