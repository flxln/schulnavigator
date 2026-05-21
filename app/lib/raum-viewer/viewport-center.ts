import { clamp } from '@/lib/raum-viewer/constants'

export function normalizedViewportCenter(
  panPx: number,
  containerW: number,
  displayW: number,
): { x: number; y: number } {
  if (displayW <= 0 || containerW <= 0) {
    return { x: 0.5, y: 0.5 }
  }
  const imageX = containerW / 2 - panPx
  const x = imageX / displayW
  return { x: clamp(x, 0, 1), y: 0.5 }
}
