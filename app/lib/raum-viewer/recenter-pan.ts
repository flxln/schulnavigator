import { centeredPanPx } from '@/lib/raum-viewer/pan-from-orientation'
import type { PanAxis } from '@/lib/raum-viewer/pan-from-orientation'

export function panPxAfterRecenter(maxPan: number, panAxis: PanAxis): number {
  if (maxPan > 0) {
    return panAxis === 'alpha' ? centeredPanPx(maxPan) : 0
  }
  return 0
}
