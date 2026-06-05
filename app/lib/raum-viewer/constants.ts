export const DEFAULT_HOTSPOT_RADIUS = 0.08
/** Mit Nutzer auf iPhone Safari kalibriert; bei Beschwerden in 0,1-Schritten anpassen. */
export const GYRO_DEADZONE_DEG = 2
/** Mit Nutzer auf iPhone Safari kalibriert; bei Beschwerden in 0,1-Schritten anpassen. */
export const GYRO_SENSITIVITY = 1
/** ± dieser Winkel vom Neutral = je ein Bildrand (zweiseitig, Portrait/alpha). */
export const GYRO_FULL_RANGE_DEG = 60
/**
 * Portrait/alpha: Drehen nach rechts → Pan Richtung 0 (rechter Rand).
 * Am iPhone verifizieren; bei invertiertem Pan Vorzeichen flippen.
 */
export const GYRO_ALPHA_PAN_SIGN = 1
/** Portrait-Gimbal-Zone betreten: |β−90°| < diese Toleranz → γ-Fallback aktiv. */
export const GIMBAL_LOCK_ENTER_DEG = 10
/** Verlassen erst bei |β−90°| > diese Toleranz (Hysterese gegen Flattern am Rand). */
export const GIMBAL_LOCK_EXIT_DEG = 15
/** γ-Fallback: am iPhone verifizieren; bei invertiertem Pan Vorzeichen flippen. */
export const GYRO_GAMMA_PAN_SIGN = -1
/** γ-als-Yaw-Hub bei β≈90°; separat von GYRO_FULL_RANGE_DEG tunebar. */
export const GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG = 60
export const PAN_SMOOTHING = 0.22
/** Viewport-Mitte im Hotspot: nur Marker hervorheben, nicht Medien öffnen. */
export const HOTSPOT_CENTER_DWELL_MS = 450
export const HOTSPOT_DEBOUNCE_MS = 280
/** Sichtbare Viewer-Höhe (höhenbasierte Bildskalierung, Gyro-Pan). */
export const ROOM_VIEWER_HEIGHT_CSS = 'min(50vh,360px)'
export const ROOM_VIEWER_MAX_HEIGHT_PX = 360
/** Warnung in Dev, wenn Anzeige-Breite / Viewport-Breite darunter liegt (kaum Gyro-Wirkung). */
export const MIN_PAN_DISPLAY_RATIO = 2
/** Empfohlenes Seitenverhältnis Breite:Höhe der Quelldatei (Panorama, z. B. 2500×1000). */
export const RECOMMENDED_SOURCE_ASPECT_MIN = 2.5

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
