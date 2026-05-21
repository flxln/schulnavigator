import type { Hotspot } from '@/lib/types'
import { DEFAULT_HOTSPOT_RADIUS } from '@/lib/raum-viewer/constants'

function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

export function hitTestHotspot(
  center: { x: number; y: number },
  hotspots: readonly Hotspot[],
): Hotspot | null {
  let best: Hotspot | null = null
  let bestD = Infinity
  for (const hs of hotspots) {
    const r = hs.radius ?? DEFAULT_HOTSPOT_RADIUS
    const d = Math.sqrt(dist2(center.x, center.y, hs.x, hs.y))
    if (d <= r && d < bestD) {
      bestD = d
      best = hs
    }
  }
  return best
}
