export const DEFAULT_HOTSPOT_RADIUS = 0.08
export const GYRO_DEADZONE_DEG = 5
export const GYRO_SENSITIVITY = 0.45
export const PAN_SMOOTHING = 0.15
export const HOTSPOT_DEBOUNCE_MS = 280
export const MIN_PAN_DISPLAY_RATIO = 1.8

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function clampPan(panPx: number, maxPanPx: number): number {
  if (maxPanPx <= 0) return 0
  return clamp(panPx, -maxPanPx, 0)
}

export function imageDisplayWidth(
  naturalW: number,
  naturalH: number,
  containerH: number,
): number {
  if (naturalH <= 0 || naturalW <= 0 || containerH <= 0) return 0
  return (naturalW / naturalH) * containerH
}

export function maxPanPx(displayW: number, containerW: number): number {
  return Math.max(0, displayW - containerW)
}
