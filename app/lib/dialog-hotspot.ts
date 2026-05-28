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
