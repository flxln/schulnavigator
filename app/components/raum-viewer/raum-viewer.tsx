'use client'

import type { Hotspot, Medium } from '@/lib/types'
import { RoomImagePane } from '@/components/raum-viewer/room-image-pane'

export type RaumViewerProps = {
  bild: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  onHotspotTap?: (hotspot: Hotspot) => void
}

export function RaumViewer({
  bild,
  alt,
  hotspots,
  medien,
  onHotspotTap,
}: RaumViewerProps) {
  return (
    <div className="flex flex-col gap-2">
      <RoomImagePane
        src={bild}
        alt={alt}
        hotspots={hotspots}
        medien={medien}
        onHotspotTap={onHotspotTap}
      />
      <p className="text-center text-xs text-zinc-500">
        Raum erkunden — Bewegung folgt in Phase 2 (Gyro-Viewer).
      </p>
    </div>
  )
}
