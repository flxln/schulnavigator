import {
  DEFAULT_MASCOT_SIZE_NORM,
  MAX_MASCOT_SIZE_NORM,
  MIN_MASCOT_SIZE_NORM,
  clamp,
} from '@/lib/raum-viewer/constants'
import type { DialogFigure, Hotspot, HotspotBase, Station } from '@/lib/types'

/** Funktioniert für Flat-Hotspots (Hotspot) und Sphere-Hotspots (Hotspot360). */
export function isMascotDialogHotspot(hs: HotspotBase): boolean {
  return hs.action === 'dialog' && hs.mascot !== undefined
}

/**
 * Station nutzt Maskottchen-Hotspots statt Cutscene (ADR-011).
 * Prüft sowohl `hotspots` (flat) als auch `hotspots360` (sphere, ADR-018).
 */
export function stationUsesMascotDialogHotspot(station: Station): boolean {
  return Boolean(
    station.dialog &&
      (station.hotspots?.some((hs) => isMascotDialogHotspot(hs)) ||
        station.hotspots360?.some((hs) => isMascotDialogHotspot(hs))),
  )
}

export function mascotFromHotspot(hs: HotspotBase): DialogFigure | null {
  return hs.mascot ?? null
}

export function resolveMascotSizeNorm(hs: HotspotBase): number {
  const v = hs.mascotSize ?? DEFAULT_MASCOT_SIZE_NORM
  return clamp(v, MIN_MASCOT_SIZE_NORM, MAX_MASCOT_SIZE_NORM)
}

export function resolveMascotHeightPx(
  hs: HotspotBase,
  containerHeight: number,
): number {
  if (containerHeight <= 0) return 0
  return resolveMascotSizeNorm(hs) * containerHeight
}

/** Typ-Guard: ist der Hotspot ein Flat-Hotspot mit x/y-Koordinaten? */
export function isFlatHotspot(hs: HotspotBase): hs is Hotspot {
  return 'x' in hs && 'y' in hs
}
