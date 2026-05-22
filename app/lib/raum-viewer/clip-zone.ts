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
