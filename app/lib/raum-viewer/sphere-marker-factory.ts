import type { DialogFigure, DialogRolle, Hotspot360, Medium } from '@/lib/types'
import {
  isMascotDialogHotspot,
  mascotFromHotspot,
} from '@/lib/dialog-hotspot'
import { isMascotSpeaking } from '@/lib/dialog-display'
import { presetIconForMediumTyp } from '@/lib/hotspot-marker'
import {
  resolveImageLayerSize,
  yawPitchToRadians,
} from '@/lib/raum-viewer/sphere-marker-conventions'
import { buildSphereMarkerHtml } from '@/lib/raum-viewer/sphere-marker-html'

const MASCOT_SRC: Record<DialogFigure, string> = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
}

export type SphereMarkerKind = 'imageLayer' | 'htmlMascot' | 'htmlDot'

export type SphereMarkerBuildResult = {
  kind: SphereMarkerKind
  config: Record<string, unknown>
  mascotElement?: HTMLElement
}

export type BuildSphereMarkerOptions = {
  hs: Hotspot360
  medien: Medium[]
  containerHeight: number
  isActive: boolean
  speakingRolle?: DialogRolle | null
}

function resolveMediaImageSrc(
  hs: Hotspot360,
  medium: Medium | undefined,
): string | null {
  if (hs.icon) return hs.icon
  if (medium?.thumbnail) return medium.thumbnail
  if (medium?.typ) return presetIconForMediumTyp(medium.typ)
  return null
}

function createMascotElement(
  hs: Hotspot360,
  containerHeight: number,
  isActive: boolean,
  speakingRolle: DialogRolle | null | undefined,
): HTMLElement | null {
  const mascot = mascotFromHotspot(hs)
  if (!mascot) return null

  const speaking = speakingRolle
    ? isMascotSpeaking(speakingRolle, mascot)
    : isActive
  const dimmed = Boolean(speakingRolle && !speaking)
  const { height } = resolveImageLayerSize(hs, 'mascot', containerHeight)

  const wrap = document.createElement('div')
  wrap.className =
    'flex cursor-pointer items-end justify-center touch-manipulation pointer-events-auto'
  wrap.style.opacity = dimmed ? '0.45' : '1'
  wrap.setAttribute('role', 'button')
  wrap.setAttribute('aria-label', hs.label ?? hs.id)

  const img = document.createElement('img')
  img.src = MASCOT_SRC[mascot]
  img.alt = ''
  img.draggable = false
  img.className = `sn-dialog-mascot__img object-contain drop-shadow-lg${speaking ? ' sn-dialog-mascot__img--speaking' : ''}${hs.mascotFlipX ? ' sn-dialog-mascot__img--flip-x' : ''}`
  img.style.height = `${height}px`
  img.style.width = 'auto'
  img.style.display = 'block'

  wrap.appendChild(img)
  return wrap
}

export function applyMascotElementState(
  element: HTMLElement,
  hs: Hotspot360,
  containerHeight: number,
  isActive: boolean,
  speakingRolle?: DialogRolle | null,
): void {
  const mascot = mascotFromHotspot(hs)
  if (!mascot) return
  const speaking = speakingRolle
    ? isMascotSpeaking(speakingRolle, mascot)
    : isActive
  const dimmed = Boolean(speakingRolle && !speaking)
  element.style.opacity = dimmed ? '0.45' : '1'
  const img = element.querySelector('img')
  if (!img) return
  img.classList.toggle('sn-dialog-mascot__img--speaking', speaking)
  img.classList.toggle('sn-dialog-mascot__img--flip-x', Boolean(hs.mascotFlipX))
  const { height } = resolveImageLayerSize(hs, 'mascot', containerHeight)
  img.style.height = `${height}px`
}

export function buildSphereMarkerConfig(
  options: BuildSphereMarkerOptions,
): SphereMarkerBuildResult {
  const { hs, medien, containerHeight, isActive, speakingRolle = null } =
    options
  const position = yawPitchToRadians(hs.yaw, hs.pitch)
  const base = {
    id: hs.id,
    position,
  }

  if (isMascotDialogHotspot(hs)) {
    const mascotElement = createMascotElement(
      hs,
      containerHeight,
      isActive,
      speakingRolle,
    )
    if (mascotElement) {
      return {
        kind: 'htmlMascot',
        mascotElement,
        config: {
          ...base,
          element: mascotElement,
          anchor: 'bottom center',
        },
      }
    }
    return {
      kind: 'htmlDot',
      config: {
        ...base,
        html: buildSphereMarkerHtml({
          hs,
          medien,
          containerHeight,
          isActive,
          speakingRolle,
        }),
        anchor: 'center center',
      },
    }
  }

  const medium = hs.mediumId
    ? medien.find((x) => x.id === hs.mediumId)
    : undefined
  const src = resolveMediaImageSrc(hs, medium)

  if (src) {
    const size = resolveImageLayerSize(hs, 'icon', containerHeight)
    return {
      kind: 'imageLayer',
      config: {
        ...base,
        imageLayer: src,
        size,
        anchor: 'center center',
        opacity: isActive ? 1 : 0.95,
      },
    }
  }

  return {
    kind: 'htmlDot',
    config: {
      ...base,
      html: buildSphereMarkerHtml({
        hs,
        medien,
        containerHeight,
        isActive,
        speakingRolle,
      }),
      anchor: 'center center',
    },
  }
}

export function buildSphereMarkerVisualUpdate(
  options: BuildSphereMarkerOptions,
  kind: SphereMarkerKind,
): Record<string, unknown> {
  const { hs, medien, containerHeight, isActive, speakingRolle = null } =
    options

  if (kind === 'imageLayer') {
    return { id: hs.id, opacity: isActive ? 1 : 0.95 }
  }

  if (kind === 'htmlMascot') {
    return { id: hs.id }
  }

  return {
    id: hs.id,
    html: buildSphereMarkerHtml({
      hs,
      medien,
      containerHeight,
      isActive,
      speakingRolle,
    }),
  }
}

