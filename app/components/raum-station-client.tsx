'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, List } from 'lucide-react'
import type { Hotspot, Medium, Station } from '@/lib/types'
import { MediaSlotList } from '@/components/media-slot-list'
import {
  RaumViewer,
  RaumViewerErrorBoundary,
  StaticRoomFallback,
} from '@/components/raum-viewer'
import { NextStationFooter } from '@/components/raum/next-station-footer'
import { StationMediaPanel } from '@/components/station-media-panel'
import { StationVisitedBadge } from '@/components/station-visited-badge'
import { DialogEmbeddedBubble } from '@/components/dialog/dialog-embedded-bubble'
import { Gs39Chip, TopBar } from '@/components/ui'
import { useDialogAudioPlaylist } from '@/hooks/use-dialog-audio-playlist'
import {
  isMascotDialogHotspot,
  stationUsesMascotDialogHotspot,
} from '@/lib/dialog-hotspot'
import type { EntryMode } from '@/lib/access-tokens'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSlugsForMode } from '@/lib/hub-mode'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'

type RaumStationClientProps = {
  station: Station
  validSlugs: readonly string[]
  hubStation: IsometricHubStation
  hubStations: readonly IsometricHubStation[]
  mode: EntryMode
}

export function RaumStationClient({
  station,
  validSlugs,
  hubStation,
  hubStations,
  mode,
}: RaumStationClientProps) {
  const router = useRouter()
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedMedium, setSelectedMedium] = useState<Medium | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const mascotDialogHotspot = useMemo(
    () => stationUsesMascotDialogHotspot(station),
    [station],
  )
  const {
    audioRef: dialogAudioRef,
    startFromUserGesture,
    stopDialog,
    dialogUiActive,
    speakingRolle,
    displayText,
    tail,
  } = useDialogAudioPlaylist(station.dialog)

  const { visitedSlugs } = useVisitedStations(validSlugs)
  const stationSlugs = useMemo(
    () => hubStations.map((s) => s.slug),
    [hubStations],
  )
  const unlockedSlugs = useMemo(
    () => getUnlockedSlugsForMode(mode, stationSlugs, visitedSlugs),
    [mode, stationSlugs, visitedSlugs],
  )

  const visited = visitedSlugs.has(station.slug)
  const backHref = `/?highlight=${encodeURIComponent(station.slug)}`

  const openMedium = useCallback((m: Medium) => {
    setSelectedMedium(m)
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const onHotspotTap = useCallback(
    (hs: Hotspot) => {
      if (isMascotDialogHotspot(hs) && station.dialog) {
        setActiveHotspotId(hs.id)
        startFromUserGesture()
        return
      }
      const m =
        hs.mediumId !== undefined
          ? station.medien.find((x) => x.id === hs.mediumId)
          : undefined
      if (m) {
        setActiveHotspotId(hs.id)
        openMedium(m)
      }
    },
    [station.dialog, station.medien, openMedium, startFromUserGesture],
  )

  const onHotspotCenterHit = useCallback((hs: Hotspot | null) => {
    setActiveHotspotId(hs?.id ?? null)
  }, [])

  const endDialog = useCallback(() => {
    stopDialog()
    setActiveHotspotId(null)
  }, [stopDialog])

  const heroHeightClass = mascotDialogHotspot
    ? 'h-[min(58vh,400px)]'
    : 'h-[min(52vh,340px)]'

  return (
    <div className="sn-fade-in relative min-h-[100dvh] bg-bg-1">
      <section
        aria-labelledby="station-titel"
        className={`relative bg-brand-navy ${heroHeightClass}`}
      >
        <RaumViewerErrorBoundary>
          {station.bild ? (
            <RaumViewer
              bild={station.bild}
              alt={`Raumansicht ${station.titel}`}
              hotspots={station.hotspots}
              medien={station.medien}
              activeHotspotId={activeHotspotId}
              speakingRolle={
                mascotDialogHotspot ? speakingRolle : null
              }
              onHotspotTap={onHotspotTap}
              onHotspotCenterHit={onHotspotCenterHit}
              layout="hero"
              orientationEnabled
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4">
              <StaticRoomFallback titel={station.titel} />
            </div>
          )}
        </RaumViewerErrorBoundary>

        {mascotDialogHotspot && station.dialog ? (
          <audio ref={dialogAudioRef} preload="auto" className="sr-only" />
        ) : null}

        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/15 via-transparent to-black/55"
          aria-hidden
        />

        <div className="absolute left-0 right-0 top-0 z-10">
          <TopBar
            dark
            title=""
            onBack={() => router.push(backHref)}
            right={
              <Link
                href="/stationen"
                aria-label="Alle Stationen"
                className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white/15 text-fg-on-dark"
              >
                <List size={20} aria-hidden />
              </Link>
            }
            tight
          />
        </div>

        {mascotDialogHotspot && station.dialog ? (
          <DialogEmbeddedBubble
            text={displayText}
            tail={tail}
            accent={hubStation.accent}
            visible={dialogUiActive}
            onEnd={endDialog}
          />
        ) : null}
      </section>

      <div className="relative z-[2] -mt-6 rounded-t-[24px] bg-bg-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
        <div className="flex items-start gap-3">
          <Gs39Chip
            className="!text-fg-on-dark"
            style={{ background: hubStation.accent }}
          >
            <span className="font-display text-[28px] leading-none tracking-wide">
              {hubStation.nr}
            </span>
          </Gs39Chip>
          <div className="min-w-0 flex-1">
            <p
              className="t-eyebrow text-[11px]"
              style={{ color: hubStation.accent }}
            >
              Station {hubStation.nr} / {hubStations.length}
            </p>
            <h1
              id="station-titel"
              className="sn-brush mt-1 text-[30px] leading-none"
            >
              {station.titel}
            </h1>
          </div>
          {visited ? (
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-green text-fg-on-dark"
              title="Besucht"
            >
              <Check size={18} aria-hidden />
            </span>
          ) : (
            <StationVisitedBadge slug={station.slug} validSlugs={validSlugs} />
          )}
        </div>

        <p className="mt-3.5 text-[15px] leading-relaxed text-fg-2">
          {station.beschreibung}
        </p>

        <div className="mt-6">
          <MediaSlotList
            medien={station.medien}
            onMediaSelect={openMedium}
            accent={hubStation.accent}
            variant="station"
          />
        </div>

        <div className="mt-5">
          <NextStationFooter
            currentSlug={station.slug}
            hubStations={hubStations}
            mode={mode}
            unlockedSlugs={unlockedSlugs}
          />
        </div>
      </div>

      <StationMediaPanel
        open={panelOpen}
        medium={selectedMedium}
        onClose={closePanel}
      />
    </div>
  )
}
