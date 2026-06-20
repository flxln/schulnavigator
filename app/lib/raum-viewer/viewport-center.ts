import { clamp, clampPan } from '@/lib/raum-viewer/constants'

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

export function startPanXFromPanChange(
  panPx: number,
  effectiveDisplayW: number,
  containerW: number,
): number {
  return normalizedViewportCenter(panPx, containerW, effectiveDisplayW).x
}

export function panPxFromStartPanX(
  startPanX: number,
  containerW: number,
  effectiveDisplayW: number,
  maxPan: number,
): number {
  if (maxPan <= 0 || containerW <= 0 || effectiveDisplayW <= 0) {
    return 0
  }
  const raw = containerW / 2 - startPanX * effectiveDisplayW
  return clampPan(raw, maxPan)
}
