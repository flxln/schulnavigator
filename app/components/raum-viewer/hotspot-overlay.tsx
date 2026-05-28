'use client'

import type { DialogFigure, DialogRolle, Hotspot, Medium } from '@/lib/types'
import { isMascotDialogHotspot, mascotFromHotspot } from '@/lib/dialog-hotspot'
import { isMascotSpeaking } from '@/lib/dialog-display'

const MASCOT_SRC: Record<DialogFigure, string> = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
}

const TYP_LABEL: Record<Medium['typ'], string> = {
  audio: 'Audio',
  video: 'Video',
  foto: 'Foto',
  text: 'Text',
}

export type HotspotOverlayProps = {
  hotspots: Hotspot[]
  medien: Medium[]
  activeHotspotId?: string | null
  speakingRolle?: DialogRolle | null
  onHotspotTap?: (hotspot: Hotspot) => void
}

function hotspotAriaLabel(hs: Hotspot, medien: Medium[]): string {
  if (isMascotDialogHotspot(hs)) {
    const name = hs.label?.trim() || (hs.mascot === 'otto' ? 'Otto' : 'Frieda')
    return `${name} — Dialog starten`
  }
  const m = hs.mediumId ? medien.find((x) => x.id === hs.mediumId) : undefined
  const typ = m ? TYP_LABEL[m.typ] : 'Medium'
  const label = hs.label?.trim()
  if (label) {
    return `${label}, verknüpft mit ${typ}`
  }
  return `Hotspot, verknüpft mit ${typ}`
}

export function HotspotOverlay({
  hotspots,
  medien,
  activeHotspotId = null,
  speakingRolle = null,
  onHotspotTap,
}: HotspotOverlayProps) {
  if (hotspots.length === 0) {
    return null
  }

  const baseMarker =
    'pointer-events-auto absolute h-4 w-4 rounded-full border-2 border-fg-on-dark shadow-gs39-sm ring-2 ring-bg-dark/25'

  return (
    <ul className="pointer-events-none absolute inset-0 z-[2] m-0 list-none p-0">
      {hotspots.map((hs) => {
        const label = hotspotAriaLabel(hs, medien)
        const interactive = typeof onHotspotTap === 'function'
        const isActive = activeHotspotId === hs.id
        const anchorStyle = {
          position: 'absolute',
          left: `${hs.x * 100}%`,
          top: `${hs.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        } as const
        const colorClass = isActive
          ? 'bg-accent ring-4 ring-accent/40'
          : 'bg-brand-sun'

        if (interactive && isMascotDialogHotspot(hs)) {
          const mascot = mascotFromHotspot(hs)
          if (!mascot) {
            return null
          }
          const name = hs.label?.trim() || (mascot === 'otto' ? 'Otto' : 'Frieda')
          const speaking = speakingRolle
            ? isMascotSpeaking(speakingRolle, mascot)
            : isActive
          const dimmed = Boolean(speakingRolle && !speaking)
          return (
            <li key={hs.id} style={anchorStyle}>
              <button
                type="button"
                className={`pointer-events-auto touch-manipulation transition-opacity duration-300 ${dimmed ? 'opacity-45' : 'opacity-100'}`}
                style={{ transform: 'translate(-50%, -100%)' }}
                aria-label={label}
                aria-current={isActive ? 'true' : undefined}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onHotspotTap(hs)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Alpha-PNG */}
                <img
                  src={MASCOT_SRC[mascot]}
                  alt=""
                  width={150}
                  height={150}
                  className={`sn-dialog-mascot__img h-[130px] w-[130px] object-contain drop-shadow-lg sm:h-[150px] sm:w-[150px] ${speaking ? 'sn-dialog-mascot__img--speaking' : ''}`}
                  draggable={false}
                />
              </button>
            </li>
          )
        }

        if (interactive) {
          return (
            <li key={hs.id} style={anchorStyle}>
              <button
                type="button"
                className={`${baseMarker} ${colorClass}`}
                aria-label={label}
                aria-current={isActive ? 'true' : undefined}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onHotspotTap(hs)}
              />
            </li>
          )
        }

        return (
          <li key={hs.id} style={anchorStyle}>
            <span
              role="img"
              aria-label={label}
              tabIndex={-1}
              className={`${baseMarker} ${colorClass}`}
            />
          </li>
        )
      })}
    </ul>
  )
}
