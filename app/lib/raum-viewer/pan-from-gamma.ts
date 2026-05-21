import {
  GYRO_DEADZONE_DEG,
  GYRO_SENSITIVITY,
  clampPan,
} from '@/lib/raum-viewer/constants'

export function gammaToTargetPan(
  gammaDeg: number,
  maxPanPx: number,
  neutralDeg: number | null,
): number {
  if (maxPanPx <= 0) return 0
  const ref = neutralDeg ?? 0
  let delta = gammaDeg - ref
  if (Math.abs(delta) < GYRO_DEADZONE_DEG) {
    delta = 0
  } else {
    delta -= Math.sign(delta) * GYRO_DEADZONE_DEG
  }
  const factor = (-delta / 45) * GYRO_SENSITIVITY
  const raw = factor * maxPanPx
  return clampPan(raw, maxPanPx)
}

export function lerpPan(
  current: number,
  target: number,
  alpha: number,
): number {
  return current + (target - current) * alpha
}
