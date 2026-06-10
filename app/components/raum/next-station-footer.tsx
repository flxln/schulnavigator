'use client'

import { useRouter } from 'next/navigation'
import { NextStationRow } from '@/components/raum/next-station-row'
import type { EntryMode } from '@/lib/access-tokens'
import { isHubStationNavigable } from '@/lib/hub-mode'
import { getNextStation } from '@/lib/next-station'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type NextStationFooterProps = {
  currentSlug: string
  hubStations: readonly HubStation[]
  mode: EntryMode
  unlockedSlugs: ReadonlySet<string>
  visitedSlugs: ReadonlySet<string>
}

export function NextStationFooter({
  currentSlug,
  hubStations,
  mode,
  unlockedSlugs,
  visitedSlugs,
}: NextStationFooterProps) {
  const router = useRouter()

  const next = getNextStation(hubStations, visitedSlugs, currentSlug)
  if (!next) return null

  const locked =
    mode === 'fest' && !isHubStationNavigable(next.slug, unlockedSlugs)

  const onClick = () => {
    if (locked) {
      router.push('/scan')
      return
    }
    router.push(`/raum/${next.slug}`)
  }

  return (
    <NextStationRow
      station={next}
      locked={locked}
      eyebrow={locked ? 'Nächste Station' : 'Weiter zu'}
      onClick={onClick}
      variant="footer"
    />
  )
}
