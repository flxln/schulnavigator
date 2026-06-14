/**
 * Spike-Ergebnisse (ADR-018 Layer-Marker) — feste Konventionen für Runtime + Kalibrierung.
 *
 * 1. imageLayer: `size` Pflicht (PSV skaliert width/100 × height/100 in 3D); `anchor` wirkt.
 * 2. elementLayer: misst DOM, ignoriert `size`; Mitte auf (yaw,pitch); lookAt kippt am Boden.
 * 3. Maskottchen: html-Billboard + bottom center (Flip/Speaking/Dimmen, kein Boden-Kipp).
 * 4. Medien-Icons: imageLayer + center center.
 * 5. yaw/pitch in JSON = Ankerpunkt (Kalibrier-Tool klickt sichtbaren Anker).
 * 6. Dialog-Bubble: separater pitch-Offset nach oben (Kopf ≠ Marker-Anker).
 */

import { resolveMascotSizeNorm } from '@/lib/dialog-hotspot'
import { resolveIconSizeNorm } from '@/lib/hotspot-marker'
import type { Hotspot360 } from '@/lib/types'

/** PSV imageLayer: mesh.scale = size / 100 — Referenzhöhe für Norm→Pixel. */
export const SPHERE_LAYER_REF_VIEWER_HEIGHT = 400

/**
 * Skaliert Layer-Größe gegenüber früheren Billboard-px bei 90°-FOV.
 * Unabhängig von SPHERE_REFERENCE_FOV_DEG-Ratio-Helfern (die für html gedacht waren).
 */
export const SPHERE_LAYER_SIZE_SCALE = 1.35

/** Standard-Offset: Bubble projiziert oberhalb des Marker-Ankers (Grad). */
export const DEFAULT_BUBBLE_PITCH_OFFSET_DEG = 12

export function yawPitchToRadians(yawDeg: number, pitchDeg: number): {
  yaw: number
  pitch: number
} {
  return {
    yaw: yawDeg * (Math.PI / 180),
    pitch: pitchDeg * (Math.PI / 180),
  }
}

export function resolveBubbleProjectionPitchDeg(hs: Hotspot360): number {
  const offset = hs.bubblePitchOffset ?? DEFAULT_BUBBLE_PITCH_OFFSET_DEG
  return hs.pitch + offset
}

export function resolveImageLayerSize(
  hs: Hotspot360,
  kind: 'icon' | 'mascot',
  containerHeight: number,
): { width: number; height: number } {
  const refH = containerHeight > 0 ? containerHeight : SPHERE_LAYER_REF_VIEWER_HEIGHT
  const norm =
    kind === 'icon' ? resolveIconSizeNorm(hs) : resolveMascotSizeNorm(hs)
  const height = Math.max(16, Math.round(norm * refH * SPHERE_LAYER_SIZE_SCALE))
  const width =
    kind === 'mascot' ? Math.round(height * 0.55) : Math.round(height * 1.1)
  return { width, height }
}

export function radiansToDegrees(yaw: number, pitch: number): {
  yawDeg: number
  pitchDeg: number
} {
  return {
    yawDeg: roundDeg(yaw * (180 / Math.PI)),
    pitchDeg: roundDeg(pitch * (180 / Math.PI)),
  }
}

export function roundDeg(deg: number): number {
  return Math.round(deg * 10) / 10
}

/** Winkel auf −180…180° für JSON/Validator (PSV-Klicks können 0…360° liefern). */
export function normalizeYawDeg(deg: number): number {
  const wrapped = ((deg % 360) + 360) % 360
  const normalized = wrapped > 180 ? wrapped - 360 : wrapped
  return roundDeg(normalized)
}
