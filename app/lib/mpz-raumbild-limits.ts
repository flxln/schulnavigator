const KB = 1024
const MB = 1024 * KB

/** Harte Upload-Schranke für Flat — initial aus Display-Empfehlung 2,5:1, unabhängig evolvierbar. */
export const FLAT_UPLOAD_RATIO_MIN = 2.5

/** Gleiche Größenklasse wie Foto-Medien (`mpz-upload-rules`). */
export const FLAT_MAX_BYTES = 8 * MB

/** Equirectangular-Panoramen (bis 8192×4096) brauchen mehr Spielraum als Flat. */
export const PANO360_MAX_BYTES = 12 * MB

export const MIN_RAUMBILD_BYTES = 1024
export const FLAT_RATIO_TOLERANCE = 0.02
export const PANO360_RATIO = 2
export const PANO360_RATIO_TOLERANCE = 0.02

export function formatRaumbildBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}
