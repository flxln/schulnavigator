'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FrontSchoolhouse } from '@/components/schoolhouse/front-schoolhouse'
import { ScanCta } from '@/components/schoolhouse/scan-cta'
import { SchoolhouseSrNav } from '@/components/schoolhouse/schoolhouse-sr-nav'
import { Gs39Toast, Gs39ToastLayer } from '@/components/ui/gs39-toast'
import type { EntryMode } from '@/lib/access-tokens'
import { isHubFullyLocked } from '@/lib/hub-mode'
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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = window.setTimeout(() => setToastMessage(null), 2400)
    return () => window.clearTimeout(t)
  }, [toastMessage])

  const onStationTap = useCallback(
    (slug: string) => {
      if (mode === 'fest' && !unlockedSlugs.has(slug)) {
        const station = hubStations.find((s) => s.slug === slug)
        setToastMessage(
          station
            ? `„${station.titel}" ist noch zu — scanne den QR-Code an der Tür.`
            : 'Diese Station ist noch gesperrt.',
        )
        return
      }
      router.push(`/raum/${slug}`)
    },
    [mode, unlockedSlugs, hubStations, router],
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
      {toastMessage ? (
        <Gs39ToastLayer>
          <Gs39Toast message={toastMessage} icon="lock" />
        </Gs39ToastLayer>
      ) : null}
    </div>
  )
}
