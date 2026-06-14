import {
  normalizeYawDeg,
  roundDeg,
} from '@/lib/raum-viewer/sphere-marker-conventions'

export type SphereCalibClick = {
  yaw: number
  pitch: number
  textureX?: number
  textureY?: number
}

export type SphereCalibSnippet = {
  yawDeg: number
  pitchDeg: number
  textureX?: number
  textureY?: number
  json: string
}

export function sphereCalibFromClick(
  click: SphereCalibClick,
  hotspotId?: string,
): SphereCalibSnippet {
  const rawYawDeg = roundDeg(click.yaw * (180 / Math.PI))
  const yawDeg = normalizeYawDeg(rawYawDeg)
  const pitchDeg = roundDeg(click.pitch * (180 / Math.PI))
  const fields: string[] = [
    `  "yaw": ${yawDeg}`,
    `  "pitch": ${pitchDeg}`,
  ]
  if (hotspotId) {
    fields.unshift(`  "id": "${hotspotId}"`)
  }
  const json = `{\n${fields.join(',\n')}\n}`
  return {
    yawDeg,
    pitchDeg,
    textureX: click.textureX,
    textureY: click.textureY,
    json,
  }
}

/** Referenz: Equirectangular-Mitte → yaw 0°, pitch 0° (PSV-Konvention). */
export const SPHERE_CALIB_REFERENCE_CENTER = {
  yawDeg: 0,
  pitchDeg: 0,
} as const
