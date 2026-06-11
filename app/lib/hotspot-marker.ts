import type { Hotspot, Medium, MediumTyp } from '@/lib/types'
import {
  DEFAULT_ICON_SIZE_NORM,
  MAX_ICON_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
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

export function resolveIconSizeNorm(hs: Hotspot): number {
  const v = hs.iconSize ?? DEFAULT_ICON_SIZE_NORM
  return clamp(v, MIN_ICON_SIZE_NORM, MAX_ICON_SIZE_NORM)
}

export function presetIconForMediumTyp(typ: MediumTyp): string {
  return PRESET_ICON[typ]
}

export function resolveHotspotMarker(
  hs: Hotspot,
  medium: Medium | undefined,
  containerHeight: number,
): HotspotMarker {
  const heightPx =
    containerHeight > 0 ? resolveIconSizeNorm(hs) * containerHeight : 0

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
