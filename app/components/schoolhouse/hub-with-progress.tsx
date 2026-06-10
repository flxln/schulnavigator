'use client'

import { useMemo } from 'react'
import type { EntryMode } from '@/lib/access-tokens'
import { HubProgress } from '@/components/schoolhouse/hub-progress'
import { SchoolhouseHub } from '@/components/schoolhouse/schoolhouse-hub'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSlugsForMode } from '@/lib/hub-mode'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type HubWithProgressProps = {
  mode: EntryMode
  hubStations: readonly HubStation[]
  validSlugs: readonly string[]
  highlightSlug?: string
}

function HubLoadingPlaceholder() {
  return (
    <div
      className="relative aspect-[1087/1454] min-h-[40vh] w-full rounded-[var(--r-md)] bg-bg-3"
      aria-busy="true"
      aria-label="Fortschritt wird geladen"
    />
  )
}

export function HubWithProgress({
  mode,
  hubStations,
  validSlugs,
  highlightSlug,
}: HubWithProgressProps) {
  const { visitedSlugs, visitedCount, isHydrated } =
    useVisitedStations(validSlugs)

  const stationSlugs = useMemo(
    () => hubStations.map((s) => s.slug),
    [hubStations],
  )

  const unlockedSlugs = useMemo(
    () => getUnlockedSlugsForMode(mode, stationSlugs, visitedSlugs),
    [mode, stationSlugs, visitedSlugs],
  )

  const showPlaceholder = !isHydrated && mode === 'fest'

  return (
    <>
      <HubProgress visited={visitedCount} total={hubStations.length} />
      {showPlaceholder ? (
        <HubLoadingPlaceholder />
      ) : (
        <SchoolhouseHub
          hubStations={hubStations}
          unlockedSlugs={unlockedSlugs}
          visitedSlugs={visitedSlugs}
          mode={mode}
          isHydrated={isHydrated}
          highlightSlug={highlightSlug}
        />
      )}
    </>
  )
}
