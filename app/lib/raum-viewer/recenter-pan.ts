import { centeredPanPx } from '@/lib/raum-viewer/pan-from-orientation'
import type { PanAxis } from '@/lib/raum-viewer/pan-from-orientation'
import { panPxFromStartPanX } from '@/lib/raum-viewer/viewport-center'

export function panPxAfterRecenter(
  maxPan: number,
  panAxis: PanAxis,
  startPanX?: number,
  containerW?: number,
  effectiveDisplayW?: number,
): number {
  if (
    startPanX !== undefined &&
    containerW !== undefined &&
    effectiveDisplayW !== undefined
  ) {
    return panPxFromStartPanX(startPanX, containerW, effectiveDisplayW, maxPan)
  }
  if (maxPan > 0) {
    return panAxis === 'alpha' ? centeredPanPx(maxPan) : 0
  }
  return 0
}
