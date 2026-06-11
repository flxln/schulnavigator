'use client'

import { HomeFestScanCta } from '@/components/home/home-fest-scan-cta'
import { getNextStation } from '@/lib/next-station'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type NextStationFooterProps = {
  currentSlug: string
  hubStations: readonly HubStation[]
  visitedSlugs: ReadonlySet<string>
}

export function NextStationFooter({
  currentSlug,
  hubStations,
  visitedSlugs,
}: NextStationFooterProps) {
  const next = getNextStation(hubStations, visitedSlugs, currentSlug)
  if (!next) return null

  return <HomeFestScanCta />
}
