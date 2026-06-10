import {
  DEFAULT_MASCOT_SIZE_NORM,
  MAX_MASCOT_SIZE_NORM,
  MIN_MASCOT_SIZE_NORM,
  clamp,
} from '@/lib/raum-viewer/constants'
import type { DialogFigure, Hotspot, Station } from '@/lib/types'

export function isMascotDialogHotspot(hs: Hotspot): boolean {
  return hs.action === 'dialog' && hs.mascot !== undefined
}

/** Station nutzt Maskottchen-Hotspots statt Cutscene (ADR-011). */
export function stationUsesMascotDialogHotspot(station: Station): boolean {
  return Boolean(
    station.dialog &&
      station.hotspots?.some((hs) => isMascotDialogHotspot(hs)),
  )
}

export function mascotFromHotspot(hs: Hotspot): DialogFigure | null {
  return hs.mascot ?? null
}

export function resolveMascotSizeNorm(hs: Hotspot): number {
  const v = hs.mascotSize ?? DEFAULT_MASCOT_SIZE_NORM
  return clamp(v, MIN_MASCOT_SIZE_NORM, MAX_MASCOT_SIZE_NORM)
}

export function resolveMascotHeightPx(
  hs: Hotspot,
  containerHeight: number,
): number {
  if (containerHeight <= 0) return 0
  return resolveMascotSizeNorm(hs) * containerHeight
}
