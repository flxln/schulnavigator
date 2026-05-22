import {
  MIN_PAN_DISPLAY_RATIO,
  imageDisplayWidth,
} from '@/lib/raum-viewer/constants'

export type RoomPanZoomResult = {
  zoom: number
  baseDisplayW: number
  effectiveDisplayW: number
  effectiveDisplayH: number
}

/**
 * Skaliert das Raumbild so, dass die Anzeige-Breite mindestens
 * `minPanRatio × containerW` beträgt (Schaufenster-Pan), ggf. mit vertikalem Beschnitt.
 */
export function roomPanZoom(
  naturalW: number,
  naturalH: number,
  containerW: number,
  containerH: number,
  minPanRatio: number = MIN_PAN_DISPLAY_RATIO,
): RoomPanZoomResult {
  if (naturalH <= 0 || naturalW <= 0 || containerH <= 0 || containerW <= 0) {
    return {
      zoom: 1,
      baseDisplayW: 0,
      effectiveDisplayW: 0,
      effectiveDisplayH: 0,
    }
  }
  const naturalAspect = naturalW / naturalH
  const targetAspect = (minPanRatio * containerW) / containerH
  const zoom = naturalAspect < targetAspect ? targetAspect / naturalAspect : 1
  const baseDisplayW = imageDisplayWidth(naturalW, naturalH, containerH)
  return {
    zoom,
    baseDisplayW,
    effectiveDisplayW: baseDisplayW * zoom,
    effectiveDisplayH: containerH * zoom,
  }
}
