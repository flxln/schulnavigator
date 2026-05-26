'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { Hotspot, Medium, Station } from '@/lib/types'
import { MediaSlotList } from '@/components/media-slot-list'
import {
  RaumViewer,
  RaumViewerErrorBoundary,
  StaticRoomFallback,
} from '@/components/raum-viewer'
import { StationBackLink } from '@/components/station-back-link'
import { StationMediaPanel } from '@/components/station-media-panel'
import { StationVisitedBadge } from '@/components/station-visited-badge'

type RaumStationClientProps = {
  station: Station
  validSlugs: readonly string[]
}

export function RaumStationClient({
  station,
  validSlugs,
}: RaumStationClientProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedMedium, setSelectedMedium] = useState<Medium | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)

  const openMedium = useCallback((m: Medium) => {
    setSelectedMedium(m)
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const onHotspotTap = useCallback(
    (hs: Hotspot) => {
      const m = station.medien.find((x) => x.id === hs.mediumId)
      if (m) {
        setActiveHotspotId(hs.id)
        openMedium(m)
      }
    },
    [station.medien, openMedium],
  )

  const onHotspotCenterHit = useCallback((hs: Hotspot | null) => {
    setActiveHotspotId(hs?.id ?? null)
  }, [])

  return (
    <>
      <StationBackLink />
      <section
        role="region"
        aria-labelledby="station-titel"
        className="flex flex-col gap-3"
      >
        <RaumViewerErrorBoundary>
          {station.bild ? (
            <RaumViewer
              bild={station.bild}
              alt={`Raumansicht ${station.titel}`}
              hotspots={station.hotspots}
              medien={station.medien}
              activeHotspotId={activeHotspotId}
              onHotspotTap={onHotspotTap}
              onHotspotCenterHit={onHotspotCenterHit}
            />
          ) : (
            <StaticRoomFallback titel={station.titel} />
          )}
        </RaumViewerErrorBoundary>
        <p className="text-center">
          <Link
            href="#medien"
            className="text-sm font-medium text-accent-alt underline-offset-4 hover:text-fg-1 hover:underline"
          >
            Zu den Medien
          </Link>
        </p>
      </section>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 id="station-titel" className="text-2xl font-semibold text-fg-1">
            {station.titel}
          </h1>
          <StationVisitedBadge slug={station.slug} validSlugs={validSlugs} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-fg-2 leading-relaxed">
          {station.beschreibung}
        </p>
      </header>
      <MediaSlotList medien={station.medien} onMediaSelect={openMedium} />
      <StationMediaPanel
        open={panelOpen}
        medium={selectedMedium}
        onClose={closePanel}
      />
    </>
  )
}
