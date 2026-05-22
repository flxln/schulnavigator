import {
  GYRO_ALPHA_PAN_SIGN,
  GYRO_DEADZONE_DEG,
  GYRO_FULL_RANGE_DEG,
  GYRO_SENSITIVITY,
  clampPan,
} from '@/lib/raum-viewer/constants'

export type PanMappingMode = 'centered' | 'oneSided'

export type PanAxis = 'alpha' | 'gamma'

export function normalizeDeg(deg: number): number {
  let d = deg % 360
  if (d < 0) {
    d += 360
  }
  return d
}

export function angleDeltaDeg(current: number, neutral: number): number {
  let d = current - neutral
  while (d > 180) {
    d -= 360
  }
  while (d < -180) {
    d += 360
  }
  return d
}

export function circularMeanDeg(samples: readonly number[]): number {
  if (samples.length === 0) {
    return 0
  }
  let sinSum = 0
  let cosSum = 0
  for (const a of samples) {
    const r = (a * Math.PI) / 180
    sinSum += Math.sin(r)
    cosSum += Math.cos(r)
  }
  const n = samples.length
  return (Math.atan2(sinSum / n, cosSum / n) * 180) / Math.PI
}

export function circularEmaDeg(
  prev: number | null,
  next: number,
  emaAlpha: number,
): number {
  if (prev === null) {
    return normalizeDeg(next)
  }
  const d = angleDeltaDeg(next, prev)
  return normalizeDeg(prev + emaAlpha * d)
}

function applyDeadzoneDelta(delta: number): number {
  if (Math.abs(delta) < GYRO_DEADZONE_DEG) {
    return 0
  }
  return delta - Math.sign(delta) * GYRO_DEADZONE_DEG
}

export function centeredPanPx(maxPanPx: number): number {
  if (maxPanPx <= 0) {
    return 0
  }
  return -maxPanPx / 2
}

export function resolvePanAxis(): PanAxis {
  if (typeof window === 'undefined') {
    return 'alpha'
  }
  const type = window.screen?.orientation?.type
  if (type?.includes('landscape')) {
    return 'gamma'
  }
  if (type?.includes('portrait')) {
    return 'alpha'
  }
  return window.matchMedia('(orientation: portrait)').matches ? 'alpha' : 'gamma'
}

export function panMappingForAxis(axis: PanAxis): PanMappingMode {
  return axis === 'alpha' ? 'centered' : 'oneSided'
}

export function orientationToTargetPan(
  angleDeg: number,
  maxPanPx: number,
  neutralDeg: number | null,
  mode: PanMappingMode,
  useCircularDelta: boolean,
): number {
  if (maxPanPx <= 0) {
    return 0
  }
  const ref = neutralDeg ?? angleDeg
  const rawDelta = useCircularDelta
    ? angleDeltaDeg(angleDeg, ref)
    : angleDeg - ref
  const delta = applyDeadzoneDelta(rawDelta)

  if (mode === 'centered') {
    const half = maxPanPx / 2
    const raw =
      -half +
      (GYRO_ALPHA_PAN_SIGN * delta) / GYRO_FULL_RANGE_DEG * half * GYRO_SENSITIVITY
    return clampPan(raw, maxPanPx)
  }

  const factor = (-delta / GYRO_FULL_RANGE_DEG) * GYRO_SENSITIVITY
  return clampPan(factor * maxPanPx, maxPanPx)
}

export function neutralAngleForPan(
  angleDeg: number,
  panPx: number,
  maxPanPx: number,
  mode: PanMappingMode,
  useCircularDelta: boolean,
): number {
  if (maxPanPx <= 0) {
    return angleDeg
  }
  const p = clampPan(panPx, maxPanPx)

  if (mode === 'centered') {
    const half = maxPanPx / 2
    if (Math.abs(p + half) < 0.001) {
      return useCircularDelta ? normalizeDeg(angleDeg) : angleDeg
    }
    let eff =
      ((p + half) / half) * (GYRO_FULL_RANGE_DEG / GYRO_SENSITIVITY) / GYRO_ALPHA_PAN_SIGN
    const delta =
      eff > 0 ? eff + GYRO_DEADZONE_DEG : eff < 0 ? eff - GYRO_DEADZONE_DEG : 0
    const neutral = angleDeg - delta
    return useCircularDelta ? normalizeDeg(neutral) : neutral
  }

  if (p === 0) {
    return angleDeg
  }
  const eff = (-p / maxPanPx) * (GYRO_FULL_RANGE_DEG / GYRO_SENSITIVITY)
  const delta =
    eff > 0 ? eff + GYRO_DEADZONE_DEG : eff < 0 ? eff - GYRO_DEADZONE_DEG : 0
  return angleDeg - delta
}

export function lerpPan(
  current: number,
  target: number,
  alpha: number,
): number {
  return current + (target - current) * alpha
}
