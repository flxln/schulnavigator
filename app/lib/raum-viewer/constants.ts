export const DEFAULT_HOTSPOT_RADIUS = 0.08
/** Dialog-Maskottchen: Anteil von effectiveDisplayH; am Hero-Viewer kalibrieren. */
export const MIN_MASCOT_SIZE_NORM = 0.05
export const MAX_MASCOT_SIZE_NORM = 1
/** Startkandidat (~130 px bei effectiveDisplayH ≈ 590 px im Hero). */
export const DEFAULT_MASCOT_SIZE_NORM = 0.22
/** Medien-Hotspot-Icon: Anteil von effectiveDisplayH; [ADR-017]. */
export const MIN_ICON_SIZE_NORM = 0.05
export const MAX_ICON_SIZE_NORM = 0.25
export const DEFAULT_ICON_SIZE_NORM = 0.1
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
/**
 * Portrait-γ-Fallback global an/aus. AUS, weil die symmetrische Lock-Zone
 * (80–100°) die stabile Seite (80–90°, Handy aufrecht „vor der Brust") mitfing
 * und genau dort von α auf γ umschaltete → sichtbares Springen in der
 * Normalhaltung. Mit `false` pant Portrait durchgehend über α-Delta.
 * Zum Reaktivieren (z. B. Variante B: Zone nur oberhalb 90°) auf `true` und
 * GIMBAL_LOCK_ENTER/EXIT entsprechend verschieben.
 */
export const PORTRAIT_GAMMA_FALLBACK_ENABLED = false
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

/** Sphere-Viewer (PSV): Gyro-Roll (Seitwärts-Kippen des Bildes) — `GyroscopePlugin.roll`. */
export const SPHERE_GYRO_ROLL_ENABLED = false

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
