'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { DialogRolle, Hotspot, Medium } from '@/lib/types'
import {
  RoomImagePane,
  type RoomImagePaneHandle,
} from '@/components/raum-viewer/room-image-pane'

export type RaumViewerLayout = 'default' | 'hero'

export type RaumViewerHandle = RoomImagePaneHandle

export type RaumViewerProps = {
  bild: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  activeHotspotId?: string | null
  speakingRolle?: DialogRolle | null
  onHotspotTap?: (hotspot: Hotspot) => void
  onHotspotCenterHit?: (hotspot: Hotspot | null) => void
  onPanChange?: (panPx: number, effectiveDisplayW: number, containerW: number) => void
  layout?: RaumViewerLayout
  orientationEnabled?: boolean
}

export const RaumViewer = forwardRef<RaumViewerHandle, RaumViewerProps>(
  function RaumViewer(
    {
      bild,
      alt,
      hotspots,
      medien,
      activeHotspotId,
      speakingRolle = null,
      onHotspotTap,
      onHotspotCenterHit,
      onPanChange,
      layout = 'default',
      orientationEnabled = true,
    },
    ref,
  ) {
    const paneRef = useRef<RoomImagePaneHandle>(null)
    const isHero = layout === 'hero'

    useImperativeHandle(
      ref,
      () => ({
        recenterView: () => paneRef.current?.recenterView(),
      }),
      [],
    )

    return (
      <div className={isHero ? 'h-full' : 'flex flex-col gap-2'}>
        <RoomImagePane
          ref={paneRef}
          src={bild}
          alt={alt}
          hotspots={hotspots}
          medien={medien}
          activeHotspotId={activeHotspotId}
          speakingRolle={speakingRolle}
          onHotspotTap={onHotspotTap}
          onHotspotCenterHit={onHotspotCenterHit}
          onPanChange={onPanChange}
          layout={layout}
          orientationEnabled={orientationEnabled}
        />
        {!isHero && !hotspots?.length ? (
          <p className="text-center text-xs text-fg-3">
            Sobald Hotspots in den Daten stehen, erscheinen Marker im Raumfoto.
          </p>
        ) : null}
      </div>
    )
  },
)

RaumViewer.displayName = 'RaumViewer'
