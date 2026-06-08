import {
  GIMBAL_LOCK_ENTER_DEG,
  GIMBAL_LOCK_EXIT_DEG,
  GYRO_ALPHA_PAN_SIGN,
  GYRO_DEADZONE_DEG,
  GYRO_FULL_RANGE_DEG,
  GYRO_SENSITIVITY,
  clampPan,
} from '@/lib/raum-viewer/constants'

export type PanMappingMode = 'centered' | 'oneSided'

export type PanAxis = 'alpha' | 'gamma'

export type PanMappingOpts = {
  sign?: number
  fullRangeDeg?: number
}

function resolveMappingOpts(opts?: PanMappingOpts): {
  sign: number
  fullRangeDeg: number
} {
  return {
    sign: opts?.sign ?? GYRO_ALPHA_PAN_SIGN,
    fullRangeDeg: opts?.fullRangeDeg ?? GYRO_FULL_RANGE_DEG,
  }
}

export function isGimbalLock(beta: number, wasLocked: boolean): boolean {
  const dist = Math.abs(beta - 90)
  if (dist < GIMBAL_LOCK_ENTER_DEG) {
    return true
  }
  if (dist > GIMBAL_LOCK_EXIT_DEG) {
    return false
  }
  return wasLocked
}

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/**
 * Stabiler Yaw (Blickrichtung) aus α/β/γ statt rohem α.
 *
 * Nahe β=90° (Handy aufrecht) sind α und γ Euler-gekoppelt: der Sensor verteilt
 * dieselbe Drehung mal auf α, mal auf γ → rohes α zittert. Wir bauen stattdessen
 * den Welt-Richtungsvektor der Geräte-Rückseite (−Z) aus der vollen
 * Rotationsmatrix und nehmen dessen horizontalen Azimut. Das Euler-Zittern kürzt
 * sich in der Matrix heraus — die Richtung bleibt durch β=90° hindurch ruhig.
 *
 * Bei senkrechtem Handy (β=90°, γ=0) reduziert sich das Ergebnis auf α, damit die
 * vorhandene Pan-Kalibrierung (Vorzeichen/Range) unverändert weiter gilt.
 *
 * Liefert `null`, wenn die Rückseite (fast) senkrecht zeigt (Handy flach, β≈0) —
 * dort ist der Azimut undefiniert; Aufrufer behält dann den letzten Wert.
 */
export function headingFromOrientation(
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
): number | null {
  const a = alphaDeg * DEG_TO_RAD
  const b = betaDeg * DEG_TO_RAD
  const g = gammaDeg * DEG_TO_RAD
  const cA = Math.cos(a)
  const sA = Math.sin(a)
  const sB = Math.sin(b)
  const cG = Math.cos(g)
  const sG = Math.sin(g)
  // Horizontale Weltkomponenten der Rückseiten-Richtung (−Z im Gerät).
  // β steckt nur in der Vertikalkomponente → für den Azimut nicht nötig.
  const worldX = -(cA * sG + cG * sA * sB)
  const worldY = -(sA * sG - cA * cG * sB)
  if (Math.abs(worldX) < 1e-6 && Math.abs(worldY) < 1e-6) {
    return null
  }
  return Math.atan2(-worldX, worldY) * RAD_TO_DEG
}

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
  opts?: PanMappingOpts,
): number {
  if (maxPanPx <= 0) {
    return 0
  }
  const { sign, fullRangeDeg } = resolveMappingOpts(opts)
  const ref = neutralDeg ?? angleDeg
  const rawDelta = useCircularDelta
    ? angleDeltaDeg(angleDeg, ref)
    : angleDeg - ref
  const delta = applyDeadzoneDelta(rawDelta)

  if (mode === 'centered') {
    const half = maxPanPx / 2
    const raw =
      -half + (sign * delta) / fullRangeDeg * half * GYRO_SENSITIVITY
    return clampPan(raw, maxPanPx)
  }

  const factor = (-delta / fullRangeDeg) * GYRO_SENSITIVITY
  return clampPan(factor * maxPanPx, maxPanPx)
}

export function neutralAngleForPan(
  angleDeg: number,
  panPx: number,
  maxPanPx: number,
  mode: PanMappingMode,
  useCircularDelta: boolean,
  opts?: PanMappingOpts,
): number {
  if (maxPanPx <= 0) {
    return angleDeg
  }
  const { sign, fullRangeDeg } = resolveMappingOpts(opts)
  const p = clampPan(panPx, maxPanPx)

  if (mode === 'centered') {
    const half = maxPanPx / 2
    if (Math.abs(p + half) < 0.001) {
      return useCircularDelta ? normalizeDeg(angleDeg) : angleDeg
    }
    const eff =
      ((p + half) / half) * (fullRangeDeg / GYRO_SENSITIVITY) / sign
    const delta =
      eff > 0 ? eff + GYRO_DEADZONE_DEG : eff < 0 ? eff - GYRO_DEADZONE_DEG : 0
    const neutral = angleDeg - delta
    return useCircularDelta ? normalizeDeg(neutral) : neutral
  }

  if (p === 0) {
    return angleDeg
  }
  const eff = (-p / maxPanPx) * (fullRangeDeg / GYRO_SENSITIVITY)
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
