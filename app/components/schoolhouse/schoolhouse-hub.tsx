'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IsometricSchoolhouse } from '@/components/schoolhouse/isometric-schoolhouse'
import { ScanCta } from '@/components/schoolhouse/scan-cta'
import { SchoolhouseSrNav } from '@/components/schoolhouse/schoolhouse-sr-nav'
import { Gs39Toast, Gs39ToastLayer } from '@/components/ui/gs39-toast'
import type { EntryMode } from '@/lib/access-tokens'
import { isHubFullyLocked } from '@/lib/hub-mode'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'

type SchoolhouseHubProps = {
  hubStations: readonly IsometricHubStation[]
  unlockedSlugs: ReadonlySet<string>
  visitedSlugs: ReadonlySet<string>
  mode: EntryMode
  isHydrated: boolean
  highlightSlug?: string
}

export function SchoolhouseHub({
  hubStations,
  unlockedSlugs,
  visitedSlugs,
  mode,
  isHydrated,
  highlightSlug,
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
    <div className="flex flex-col gap-6">
      <SchoolhouseSrNav
        hubStations={hubStations}
        unlockedSlugs={unlockedSlugs}
      />
      <div className="relative w-full">
        <IsometricSchoolhouse
          stations={hubStations}
          visitedSlugs={visitedSlugs}
          unlockedSlugs={unlockedSlugs}
          highlightSlug={highlightSlug}
          mode={mode}
          isHydrated={isHydrated}
          onStationTap={onStationTap}
        />
      </div>
      {allLocked ? (
        <p
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-center text-sm text-fg-1"
          role="status"
        >
          Stationen sind gesperrt. Bitte scanne den QR-Code an der Raumtür.
        </p>
      ) : null}
      <ScanCta />
      {toastMessage ? (
        <Gs39ToastLayer>
          <Gs39Toast message={toastMessage} icon="lock" />
        </Gs39ToastLayer>
      ) : null}
    </div>
  )
}
