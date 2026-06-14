'use client'

import type { DialogFigure, DialogRolle, Hotspot, Medium } from '@/lib/types'
import {
  isMascotDialogHotspot,
  mascotFromHotspot,
  resolveMascotHeightPx,
} from '@/lib/dialog-hotspot'
import { isMascotSpeaking } from '@/lib/dialog-display'
import { resolveHotspotMarker } from '@/lib/hotspot-marker'
import {
  hotspotImageY,
  type HotspotYBand,
} from '@/lib/raum-viewer/clip-zone'

const MASCOT_SRC: Record<DialogFigure, string> = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
}

const TYP_LABEL: Record<Medium['typ'], string> = {
  audio: 'Audio',
  video: 'Video',
  foto: 'Foto',
  text: 'Text',
  link: 'Link',
  embed: 'Embed',
}

export type HotspotOverlayProps = {
  hotspots: Hotspot[]
  medien: Medium[]
  /** Panorama-Anzeigehöhe in px (= effectiveDisplayH). */
  containerHeight: number
  /** Sichtbarer y-Bereich auf dem Bild-Layer (für viewport-relative JSON-y). */
  yBand: HotspotYBand
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
  containerHeight,
  yBand,
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
        const imageY = hotspotImageY(hs.y, yBand)
        const centerAnchorStyle = {
          position: 'absolute',
          left: `${hs.x * 100}%`,
          top: `${imageY * 100}%`,
          transform: 'translate(-50%, -50%)',
        } as const
        const footAnchorStyle = {
          position: 'absolute',
          left: `${hs.x * 100}%`,
          top: `${imageY * 100}%`,
          transform: 'translate(-50%, -100%)',
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
          const mascPx = resolveMascotHeightPx(hs, containerHeight)
          const mascotImgClass = `sn-dialog-mascot__img object-contain drop-shadow-lg md:drop-shadow-2xl ${speaking ? 'sn-dialog-mascot__img--speaking' : ''}`
          return (
            <li key={hs.id} style={footAnchorStyle}>
              <button
                type="button"
                className={`pointer-events-auto flex min-h-11 min-w-11 touch-manipulation items-end justify-center transition-opacity duration-300 ${dimmed ? 'opacity-45' : 'opacity-100'}`}
                aria-label={label}
                aria-current={isActive ? 'true' : undefined}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onHotspotTap(hs)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Alpha-PNG */}
                <img
                  src={MASCOT_SRC[mascot]}
                  alt=""
                  className={`${mascotImgClass}${hs.mascotFlipX ? ' sn-dialog-mascot__img--flip-x' : ''}`}
                  style={{ height: mascPx, width: 'auto', display: 'block' }}
                  draggable={false}
                />
              </button>
            </li>
          )
        }

        const medium = hs.mediumId
          ? medien.find((x) => x.id === hs.mediumId)
          : undefined
        const marker = resolveHotspotMarker(hs, medium, containerHeight)
        const ringClass = isActive
          ? 'ring-4 ring-accent/40'
          : 'ring-2 ring-bg-dark/25'

        if (marker.kind === 'image') {
          const imgClass =
            'object-contain drop-shadow-lg pointer-events-none select-none'
          if (interactive) {
            return (
              <li key={hs.id} style={centerAnchorStyle}>
                <button
                  type="button"
                  className={`pointer-events-auto flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full ${ringClass}`}
                  aria-label={label}
                  aria-current={isActive ? 'true' : undefined}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onHotspotTap(hs)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Hotspot-Icon PNG/SVG */}
                  <img
                    src={marker.src}
                    alt=""
                    className={imgClass}
                    style={{
                      height: marker.heightPx,
                      width: 'auto',
                      display: 'block',
                    }}
                    draggable={false}
                  />
                </button>
              </li>
            )
          }
          return (
            <li key={hs.id} style={centerAnchorStyle}>
              <span
                role="img"
                aria-label={label}
                tabIndex={-1}
                className={`pointer-events-auto flex min-h-11 min-w-11 items-center justify-center rounded-full ${ringClass}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Hotspot-Icon PNG/SVG */}
                <img
                  src={marker.src}
                  alt=""
                  className={imgClass}
                  style={{
                    height: marker.heightPx,
                    width: 'auto',
                    display: 'block',
                  }}
                  draggable={false}
                />
              </span>
            </li>
          )
        }

        if (interactive) {
          return (
            <li key={hs.id} style={centerAnchorStyle}>
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
          <li key={hs.id} style={centerAnchorStyle}>
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
