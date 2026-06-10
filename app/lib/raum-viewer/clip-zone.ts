export type HotspotYBand = { yMin: number; yMax: number }

/**
 * Sichtbarer vertikaler Bereich des Bildes in normalisierten Koordinaten (0–1),
 * wenn das Bild per Zoom vertikal zentriert und beschnitten wird.
 */
export function visibleYNormalRange(
  naturalAspect: number,
  containerW: number,
  containerH: number,
  minPanRatio: number,
): { yMin: number; yMax: number } {
  if (containerH <= 0 || containerW <= 0 || naturalAspect <= 0) {
    return { yMin: 0, yMax: 1 }
  }
  const targetAspect = (minPanRatio * containerW) / containerH
  const zoom = naturalAspect < targetAspect ? targetAspect / naturalAspect : 1
  if (zoom <= 1) {
    return { yMin: 0, yMax: 1 }
  }
  const yMin = (zoom - 1) / (2 * zoom)
  const yMax = (zoom + 1) / (2 * zoom)
  return { yMin, yMax }
}

/** JSON-y (0 = oben sichtbar, 1 = unten sichtbar) → Anker auf vollem Bild-Layer. */
export function hotspotImageY(viewportY: number, band: HotspotYBand): number {
  return band.yMin + viewportY * (band.yMax - band.yMin)
}

/** Klick auf sichtbaren Layer → JSON-y (inverse von hotspotImageY). */
export function viewportYFromImageY(imageY: number, band: HotspotYBand): number {
  const span = band.yMax - band.yMin
  if (span <= 0) {
    return imageY
  }
  return (imageY - band.yMin) / span
}
