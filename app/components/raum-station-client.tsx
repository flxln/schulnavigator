'use client'

import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronUp, List, X } from 'lucide-react'
import type {
  Hotspot,
  Hotspot360,
  HotspotBase,
  Medium,
  ScreenProjection,
  Station,
  StationViewerHandle,
} from '@/lib/types'
import { MediaSlotList } from '@/components/media-slot-list'
import {
  RaumViewer,
  RaumViewerErrorBoundary,
  SphereRaumViewer,
  StaticRoomFallback,
} from '@/components/raum-viewer'
import { NextStationFooter } from '@/components/raum/next-station-footer'
import { openExternalLink } from '@/lib/external-link'
import { isDelightexUrl } from '@/lib/delightex-fallback'
import { StationMediaPanel } from '@/components/station-media-panel'
import { StationVisitedBadge } from '@/components/station-visited-badge'
import { DialogEmbeddedBubble } from '@/components/dialog/dialog-embedded-bubble'
import { StationIcon } from '@/components/station/station-icon'
import { Gs39Chip, TopBar } from '@/components/ui'
import { useDialogAudioPlaylist } from '@/hooks/use-dialog-audio-playlist'
import {
  clampBubbleOffsetX,
  resolveBubbleLayoutPx,
} from '@/lib/dialog-bubble-layout'
import {
  isMascotDialogHotspot,
  stationUsesMascotDialogHotspot,
} from '@/lib/dialog-hotspot'
import type { EntryMode } from '@/lib/access-tokens'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSlugsForMode } from '@/lib/hub-mode'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import type { HubStation } from '@/lib/schoolhouse-hub-map'
import {
  handleStationBack,
  shouldShowDialogEndIcon,
} from '@/lib/raum-station/end-dialog-flow'

/**
 * Hero-Höhe: svh statt dvh — auf iOS passt die Seite so in den kleinsten Viewport
 * (mit sichtbarer Adressleiste) und ragt nicht über den Telefonrand.
 * 6.5rem ≈ 104px Peek-Streifen der Inhaltskarte (−mt-6 → ~80px sichtbare Überschrift).
 */
const RAUM_HERO_HEIGHT_CLASS = 'h-[calc(100svh-6.5rem)]'

type RaumStationClientProps = {
  station: Station
  validSlugs: readonly string[]
  hubStation: HubStation
  hubStations: readonly HubStation[]
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
  const viewerRef = useRef<StationViewerHandle>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedMedium, setSelectedMedium] = useState<Medium | null>(null)
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null)
  const isSphere = station.viewer === 'equirectangular'
  const [sphereProjection, setSphereProjection] =
    useState<ScreenProjection | null>(null)
  const [panInfo, setPanInfo] = useState<{
    panPx: number
    effectiveDisplayW: number
    containerW: number
    containerH: number
  } | null>(null)
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
    if (m.typ === 'link' && !isDelightexUrl(m.quelle)) {
      openExternalLink(m.quelle)
    }
    setSelectedMedium(m)
    setPanelOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const handleHotspotAction = useCallback(
    (hs: HotspotBase) => {
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

  const onHotspotTap = useCallback(
    (hs: Hotspot) => handleHotspotAction(hs),
    [handleHotspotAction],
  )

  const onHotspot360Tap = useCallback(
    (hs: Hotspot360) => handleHotspotAction(hs),
    [handleHotspotAction],
  )

  const onHotspotCenterHit = useCallback((hs: Hotspot | null) => {
    setActiveHotspotId(hs?.id ?? null)
  }, [])

  const endDialog = useCallback(() => {
    stopDialog()
    setActiveHotspotId(null)
  }, [stopDialog])

  const handleBack = useCallback(() => {
    handleStationBack(dialogUiActive, endDialog, () => router.push(backHref))
  }, [dialogUiActive, endDialog, router, backHref])

  const handleChipRecenter = useCallback(() => {
    if (dialogUiActive) {
      endDialog()
    }
    viewerRef.current?.recenterView()
  }, [dialogUiActive, endDialog])

  const showDialogEndIcon = shouldShowDialogEndIcon(
    mascotDialogHotspot,
    dialogUiActive,
  )

  const handlePanChange = useCallback(
    (
      panPx: number,
      effectiveDisplayW: number,
      containerW: number,
      containerH: number,
    ) => {
      setPanInfo({ panPx, effectiveDisplayW, containerW, containerH })
    },
    [],
  )

  const handleSphereContainerReady = useCallback((w: number, h: number) => {
    setPanInfo({ panPx: 0, effectiveDisplayW: w, containerW: w, containerH: h })
  }, [])

  const handleViewChange = useCallback(
    (_yaw: number, _pitch: number) => {
      if (!activeHotspotId) {
        setSphereProjection(null)
        return
      }
      const proj = viewerRef.current?.projectHotspot?.(activeHotspotId) ?? null
      setSphereProjection(proj)
    },
    [activeHotspotId],
  )

  const bubbleOffsetX = useMemo(() => {
    if (isSphere) {
      if (!sphereProjection || !sphereProjection.visible) return 0
      if (!panInfo) return 0
      const raw = sphereProjection.x - panInfo.containerW / 2
      return clampBubbleOffsetX(raw, panInfo.containerW)
    }
    if (!panInfo || panInfo.effectiveDisplayW <= 0 || panInfo.containerW <= 0)
      return 0
    const mascotXs = (station.hotspots ?? [])
      .filter(isMascotDialogHotspot)
      .map((h) => h.x)
    if (mascotXs.length === 0) return 0
    const midX = mascotXs.reduce((a, b) => a + b, 0) / mascotXs.length
    const raw =
      panInfo.panPx +
      midX * panInfo.effectiveDisplayW -
      panInfo.containerW / 2
    return clampBubbleOffsetX(raw, panInfo.containerW)
  }, [panInfo, station.hotspots, isSphere, sphereProjection])

  const bubbleLayoutPx = useMemo(() => {
    const bubble = station.dialog?.bubble
    if (!bubble || !panInfo || panInfo.containerH <= 0) {
      return null
    }
    return resolveBubbleLayoutPx(
      bubble,
      panInfo.containerW,
      panInfo.containerH,
    )
  }, [station.dialog?.bubble, panInfo])

  const bubbleOffsetXResolved = useMemo(() => {
    if (!panInfo) return 0
    const bubble = station.dialog?.bubble
    if (bubble?.x === undefined) {
      return bubbleOffsetX
    }
    if (!bubbleLayoutPx) return 0
    const panDelta = bubbleLayoutPx.followPan ? panInfo.panPx : 0
    return clampBubbleOffsetX(
      bubbleLayoutPx.baseOffsetX + panDelta,
      panInfo.containerW,
    )
  }, [panInfo, station.dialog?.bubble, bubbleLayoutPx, bubbleOffsetX])

  return (
    <div className="sn-fade-in relative min-h-[100svh] bg-bg-1">
      <section
        aria-labelledby="station-titel"
        className={`relative bg-brand-navy ${RAUM_HERO_HEIGHT_CLASS}`}
      >
        <RaumViewerErrorBoundary>
          {isSphere && station.panorama360 ? (
            <SphereRaumViewer
              ref={viewerRef}
              panorama={station.panorama360}
              alt={`Raumansicht ${station.titel}`}
              hotspots360={station.hotspots360}
              medien={station.medien}
              activeHotspotId={activeHotspotId}
              speakingRolle={mascotDialogHotspot ? speakingRolle : null}
              onHotspotTap={onHotspot360Tap}
              onViewChange={handleViewChange}
              onContainerReady={handleSphereContainerReady}
              layout="hero"
              orientationEnabled
            />
          ) : station.bild ? (
            <RaumViewer
              ref={viewerRef}
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
              onPanChange={handlePanChange}
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
            onBack={handleBack}
            leftExtra={
              showDialogEndIcon ? (
                <button
                  type="button"
                  aria-label="Dialog beenden"
                  onClick={endDialog}
                  className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border-0 bg-white/15 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <X size={20} aria-hidden />
                </button>
              ) : undefined
            }
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
            visible={
              dialogUiActive &&
              (!isSphere || sphereProjection?.visible !== false)
            }
            layoutPx={station.dialog.bubble ? bubbleLayoutPx : undefined}
            offsetX={bubbleOffsetXResolved}
          />
        ) : null}
      </section>

      <div className="relative z-[2] -mt-6 rounded-t-[24px] bg-bg-1 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
        <div className="flex items-start gap-3">
          {station.bild || isSphere ? (
            <Gs39Chip
              as="button"
              aria-label={`${station.titel}, Raum ${hubStation.nr} von ${hubStations.length} — Raumansicht zurücksetzen`}
              className="grid place-items-center !text-fg-on-dark"
              style={{ background: hubStation.accent }}
              onClick={handleChipRecenter}
            >
              <StationIcon
                slug={hubStation.slug}
                size={28}
                visited
                accent={hubStation.accent}
                iconColorOverride={GS39_BRAND_HEX.white}
              />
            </Gs39Chip>
          ) : (
            <Gs39Chip
              className="grid place-items-center !text-fg-on-dark"
              style={{ background: hubStation.accent }}
            >
              <StationIcon
                slug={hubStation.slug}
                size={28}
                visited
                accent={hubStation.accent}
                iconColorOverride={GS39_BRAND_HEX.white}
              />
            </Gs39Chip>
          )}
          <div className="min-w-0 flex-1">
            <p
              className="t-eyebrow text-[11px]"
              style={{ color: hubStation.accent }}
            >
              Schulhaus-Rundgang
            </p>
            <h1
              id="station-titel"
              className="sn-brush mt-1 break-words text-[30px] leading-none hyphens-auto"
            >
              {station.titel}
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1">
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
            <span
              className="grid h-7 w-7 place-items-center rounded-full bg-fg-1/8 text-fg-2"
              aria-label="Nach oben wischen für mehr"
              title="Nach oben wischen für mehr"
            >
              <ChevronUp size={16} aria-hidden />
            </span>
          </div>
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
            visitedSlugs={visitedSlugs}
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
