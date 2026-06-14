import type { DialogFigure, DialogRolle, Hotspot360, Medium } from '@/lib/types'
import {
  isMascotDialogHotspot,
  mascotFromHotspot,
  resolveMascotHeightPxForSphere,
} from '@/lib/dialog-hotspot'
import { isMascotSpeaking } from '@/lib/dialog-display'
import {
  mediaIconSizingReferenceHeight,
  presetIconForMediumTyp,
  resolveIconSizeNormForSphere,
} from '@/lib/hotspot-marker'

const MASCOT_SRC: Record<DialogFigure, string> = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function resolveMarkerImage(
  hs: Hotspot360,
  medium: Medium | undefined,
  containerHeight: number,
  layoutViewportWidth?: number,
): { kind: 'dot' } | { kind: 'image'; src: string; heightPx: number } {
  const refH = mediaIconSizingReferenceHeight(
    containerHeight,
    layoutViewportWidth,
  )
  const heightPx =
    refH > 0 ? resolveIconSizeNormForSphere(hs) * refH : 32
  if (hs.icon) {
    return { kind: 'image', src: hs.icon, heightPx }
  }
  if (medium?.thumbnail) {
    return { kind: 'image', src: medium.thumbnail, heightPx }
  }
  if (medium?.typ) {
    return { kind: 'image', src: presetIconForMediumTyp(medium.typ), heightPx }
  }
  return { kind: 'dot' }
}

export type BuildSphereMarkerHtmlOptions = {
  hs: Hotspot360
  medien: Medium[]
  containerHeight: number
  layoutViewportWidth?: number
  isActive: boolean
  speakingRolle?: DialogRolle | null
}

export function buildSphereMarkerHtml({
  hs,
  medien,
  containerHeight,
  layoutViewportWidth,
  isActive,
  speakingRolle = null,
}: BuildSphereMarkerHtmlOptions): string {
  const label = escapeHtml(hs.label ?? hs.id)

  if (isMascotDialogHotspot(hs)) {
    const mascot = mascotFromHotspot(hs)
    if (!mascot) {
      return defaultDotHtml(label, isActive, true)
    }
    const speaking = speakingRolle
      ? isMascotSpeaking(speakingRolle, mascot)
      : isActive
    const dimmed = Boolean(speakingRolle && !speaking)
    const mascPx = resolveMascotHeightPxForSphere(hs, containerHeight)
    const flipClass = hs.mascotFlipX ? ' sn-dialog-mascot__img--flip-x' : ''
    const speakClass = speaking ? ' sn-dialog-mascot__img--speaking' : ''
    const opacity = dimmed ? '0.45' : '1'
    return `<div class="flex cursor-pointer items-end justify-center touch-manipulation" style="opacity:${opacity}" aria-label="${label}">
      <img src="${MASCOT_SRC[mascot]}" alt="" class="sn-dialog-mascot__img object-contain drop-shadow-lg${speakClass}${flipClass}" style="height:${mascPx}px;width:auto;display:block" draggable="false" />
    </div>`
  }

  const medium = hs.mediumId
    ? medien.find((x) => x.id === hs.mediumId)
    : undefined
  const marker = resolveMarkerImage(hs, medium, containerHeight, layoutViewportWidth)

  if (marker.kind === 'image') {
    const ringClass = isActive
      ? 'ring-4 ring-accent/40'
      : 'ring-2 ring-bg-dark/25'
    return `<div class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full ${ringClass}" aria-label="${label}">
      <img src="${escapeHtml(marker.src)}" alt="" class="object-contain drop-shadow-lg pointer-events-none" style="height:${marker.heightPx}px;width:auto;display:block" draggable="false" />
    </div>`
  }

  return defaultDotHtml(label, isActive, false)
}

function defaultDotHtml(
  label: string,
  isActive: boolean,
  isDialog: boolean,
): string {
  const baseClass =
    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform'
  const colorClass = isDialog
    ? isActive
      ? 'border-accent bg-accent/90 text-fg-on-dark scale-110'
      : 'border-accent bg-brand-sky-50/90 text-accent'
    : isActive
      ? 'border-yellow-400 bg-yellow-400 text-fg-1 scale-110'
      : 'border-yellow-400 bg-yellow-300/90 text-fg-1'
  return `<div class="${baseClass} ${colorClass}" aria-label="${label}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      ${isDialog
        ? '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
        : '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}
    </svg>
  </div>`
}
