'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Hotspot, Medium } from '@/lib/types'
import { HotspotOverlay } from '@/components/raum-viewer/hotspot-overlay'

export type RoomImagePaneProps = {
  src: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  onHotspotTap?: (hotspot: Hotspot) => void
}

export function RoomImagePane({
  src,
  alt,
  hotspots = [],
  medien,
  onHotspotTap,
}: RoomImagePaneProps) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <div className="flex h-[min(42vh,280px)] w-full items-center justify-center rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-400 px-4 text-center text-sm font-medium text-zinc-800">
        Raumbild konnte nicht geladen werden.
      </div>
    )
  }

  return (
    <div className="relative h-[min(42vh,280px)] w-full overflow-hidden rounded-lg bg-zinc-900">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        onError={() => setBroken(true)}
      />
      <HotspotOverlay
        hotspots={hotspots}
        medien={medien}
        onHotspotTap={onHotspotTap}
      />
    </div>
  )
}
