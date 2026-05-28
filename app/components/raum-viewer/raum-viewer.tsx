'use client'

import type { DialogRolle, Hotspot, Medium } from '@/lib/types'
import { RoomImagePane } from '@/components/raum-viewer/room-image-pane'

export type RaumViewerLayout = 'default' | 'hero'

export type RaumViewerProps = {
  bild: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  activeHotspotId?: string | null
  speakingRolle?: DialogRolle | null
  onHotspotTap?: (hotspot: Hotspot) => void
  onHotspotCenterHit?: (hotspot: Hotspot | null) => void
  layout?: RaumViewerLayout
  orientationEnabled?: boolean
}

export function RaumViewer({
  bild,
  alt,
  hotspots,
  medien,
  activeHotspotId,
  speakingRolle = null,
  onHotspotTap,
  onHotspotCenterHit,
  layout = 'default',
  orientationEnabled = true,
}: RaumViewerProps) {
  const isHero = layout === 'hero'

  return (
    <div className={isHero ? 'h-full' : 'flex flex-col gap-2'}>
      <RoomImagePane
        src={bild}
        alt={alt}
        hotspots={hotspots}
        medien={medien}
        activeHotspotId={activeHotspotId}
        speakingRolle={speakingRolle}
        onHotspotTap={onHotspotTap}
        onHotspotCenterHit={onHotspotCenterHit}
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
}
