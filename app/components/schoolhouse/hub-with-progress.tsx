'use client'

import { useMemo } from 'react'
import type { EntryMode } from '@/lib/access-tokens'
import { HubProgress } from '@/components/schoolhouse/hub-progress'
import { SchoolhouseHub } from '@/components/schoolhouse/schoolhouse-hub'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSegmentIdsForMode } from '@/lib/hub-mode'
import type { SchoolhouseSegment } from '@/lib/schoolhouse-segments'

type HubWithProgressProps = {
  mode: EntryMode
  segments: readonly SchoolhouseSegment[]
  validSlugs: readonly string[]
}

function HubLoadingPlaceholder() {
  return (
    <div
      className="relative aspect-[2/3] min-h-[50vh] max-h-[85vh] w-full rounded-[var(--r-md)] bg-bg-3"
      aria-busy="true"
      aria-label="Fortschritt wird geladen"
    />
  )
}

export function HubWithProgress({
  mode,
  segments,
  validSlugs,
}: HubWithProgressProps) {
  const { visitedSlugs, visitedCount, isHydrated } =
    useVisitedStations(validSlugs)

  const unlockedSegmentIds = useMemo(
    () => getUnlockedSegmentIdsForMode(mode, segments, visitedSlugs),
    [mode, segments, visitedSlugs],
  )

  const showPlaceholder = !isHydrated && mode === 'fest'

  return (
    <>
      <HubProgress visited={visitedCount} total={segments.length} />
      {showPlaceholder ? (
        <HubLoadingPlaceholder />
      ) : (
        <SchoolhouseHub
          segments={segments}
          unlockedSegmentIds={unlockedSegmentIds}
        />
      )}
    </>
  )
}
