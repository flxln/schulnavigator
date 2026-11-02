'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FrontSchoolhouse } from '@/components/schoolhouse/front-schoolhouse'
import { ScanCta } from '@/components/schoolhouse/scan-cta'
import { SchoolhouseSrNav } from '@/components/schoolhouse/schoolhouse-sr-nav'
import type { EntryMode } from '@/lib/access-tokens'
import { getHubStationTapHref, isHubFullyLocked } from '@/lib/hub-mode'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type SchoolhouseHubProps = {
  hubStations: readonly HubStation[]
  unlockedSlugs: ReadonlySet<string>
  visitedSlugs: ReadonlySet<string>
  mode: EntryMode
  isHydrated: boolean
  highlightSlug?: string
  /** Scan-CTA und Lock-Hinweis liegen auf der Home-Ebene (PR4). */
  embedded?: boolean
}

export function SchoolhouseHub({
  hubStations,
  unlockedSlugs,
  visitedSlugs,
  mode,
  isHydrated,
  highlightSlug,
  embedded = false,
}: SchoolhouseHubProps) {
  const router = useRouter()

  const onStationTap = useCallback(
    (slug: string) => {
      router.push(getHubStationTapHref(slug, mode, unlockedSlugs))
    },
    [mode, unlockedSlugs, router],
  )

  const allLocked =
    isHydrated && isHubFullyLocked(mode, unlockedSlugs, hubStations.length)

  return (
    <div className={embedded ? 'flex flex-col gap-3' : 'flex flex-col gap-6'}>
      <SchoolhouseSrNav
        hubStations={hubStations}
        unlockedSlugs={unlockedSlugs}
      />
      <div className="relative w-full">
        <FrontSchoolhouse
          stations={hubStations}
          visitedSlugs={visitedSlugs}
          unlockedSlugs={unlockedSlugs}
          highlightSlug={highlightSlug}
          mode={mode}
          isHydrated={isHydrated}
          onStationTap={onStationTap}
        />
      </div>
      {!embedded && allLocked ? (
        <p
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-center text-sm text-fg-1"
          role="status"
        >
          Stationen sind gesperrt. Bitte scanne den QR-Code an der Raumtür.
        </p>
      ) : null}
      {!embedded ? <ScanCta /> : null}
    </div>
  )
}
