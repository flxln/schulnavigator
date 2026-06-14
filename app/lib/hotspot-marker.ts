import type { Hotspot, HotspotBase, Medium, MediumTyp } from '@/lib/types'
import {
  CARD_PEEK_OFFSET_PX,
  VIEWPORT_PRESETS,
  cardPeekHeroHeight,
} from '@/lib/raum-viewer/container-geometry'
import {
  DEFAULT_ICON_SIZE_NORM,
  MAX_ICON_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
  SPHERE_LOCKED_FOV_DEG,
  SPHERE_REFERENCE_FOV_DEG,
  clamp,
} from '@/lib/raum-viewer/constants'

export type HotspotMarker =
  | { kind: 'dot' }
  | { kind: 'image'; src: string; heightPx: number }

const PRESET_ICON: Record<MediumTyp, string> = {
  audio: '/brand/hotspot-icons/audio.svg',
  video: '/brand/hotspot-icons/video.svg',
  foto: '/brand/hotspot-icons/foto.svg',
  text: '/brand/hotspot-icons/text.svg',
  link: '/brand/hotspot-icons/link.svg',
  embed: '/brand/hotspot-icons/embed.svg',
}

/** Größter Phone-Hero (Pro Max ~932 svh); große Phones unter `md` wachsen nicht darüber hinaus. */
export const MEDIA_ICON_SIZING_HEIGHT_MAX =
  932 - CARD_PEEK_OFFSET_PX

/** Erkennungsgrenze Tablet-Container-Breite — oberhalb aller Phones (≤430 px), unterhalb md:max-w-2xl (672 px). */
export const MEDIA_ICON_TABLET_BREAKPOINT_PX = 520

/** Phone-QA-Viewport (375×667): Zielgröße für Tablet-Medien-Hotspots. */
export const MEDIA_ICON_PHONE_SIZING_REF_HEIGHT = cardPeekHeroHeight(
  VIEWPORT_PRESETS.phone.h,
)

/** Referenzhöhe für Medien-Icon-px — Phone unverändert, Tablet auf QA-Phone gekappt. */
export function mediaIconSizingReferenceHeight(
  containerHeight: number,
  layoutViewportWidth?: number,
): number {
  if (containerHeight <= 0) return 0
  const isTabletLayout =
    layoutViewportWidth !== undefined &&
    layoutViewportWidth >= MEDIA_ICON_TABLET_BREAKPOINT_PX
  if (isTabletLayout) {
    return Math.min(containerHeight, MEDIA_ICON_PHONE_SIZING_REF_HEIGHT)
  }
  return Math.min(containerHeight, MEDIA_ICON_SIZING_HEIGHT_MAX)
}

export function resolveIconSizeNorm(hs: Pick<HotspotBase, 'iconSize'>): number {
  const v = hs.iconSize ?? DEFAULT_ICON_SIZE_NORM
  return clamp(v, MIN_ICON_SIZE_NORM, MAX_ICON_SIZE_NORM)
}

export function resolveIconSizeNormForSphere(
  hs: Pick<HotspotBase, 'iconSize'>,
): number {
  const flatNorm = resolveIconSizeNorm(hs)
  return flatNorm * (SPHERE_REFERENCE_FOV_DEG / SPHERE_LOCKED_FOV_DEG)
}

export function presetIconForMediumTyp(typ: MediumTyp): string {
  return PRESET_ICON[typ]
}

export function resolveHotspotMarker(
  hs: Hotspot,
  medium: Medium | undefined,
  containerHeight: number,
  layoutViewportWidth?: number,
): HotspotMarker {
  const refH = mediaIconSizingReferenceHeight(
    containerHeight,
    layoutViewportWidth,
  )
  const heightPx = refH > 0 ? resolveIconSizeNorm(hs) * refH : 0

  if (hs.icon) {
    return { kind: 'image', src: hs.icon, heightPx }
  }
  if (medium?.thumbnail) {
    return { kind: 'image', src: medium.thumbnail, heightPx }
  }
  if (medium?.typ) {
    return { kind: 'image', src: PRESET_ICON[medium.typ], heightPx }
  }
  return { kind: 'dot' }
}
