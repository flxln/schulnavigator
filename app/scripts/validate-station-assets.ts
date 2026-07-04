import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  FLAT_MAX_BYTES,
  formatRaumbildBytes,
  PANO360_MAX_BYTES,
} from '@/lib/mpz-raumbild-limits'
import { UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import type { StationsFile } from '@/lib/types'
import { jpegDimensionsFromBuffer, webpDimensionsFromBuffer } from '@/lib/image-dimensions'
const MIN_JPEG_BYTES = 1024
const PANO360_RATIO_TOLERANCE = 0.02
const JPEG_MAGIC = Buffer.from([0xff, 0xd8])
const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1'
const DIALOG_API_RE = /^\/api\/dialog\/([a-z0-9]+(-[a-z0-9]+)*)\/(\d{2}-[a-z]+\.wav)$/

export interface ValidateStationAssetsResult {
  errors: string[]
  warnings: string[]
}

export interface ValidateStationAssetsOptions {
  appRoot: string
  /** Default true — bei false nur Pfad-Auflösung, kein existsSync/Format-Check (Build ohne Medien). */
  checkFiles?: boolean
}

function resolveAssetPath(appRoot: string, urlPath: string): string | null {
  if (!urlPath.startsWith('/')) {
    return null
  }
  const publicDir = join(appRoot, 'public')
  const dialogMatch = urlPath.match(DIALOG_API_RE)
  if (dialogMatch) {
    const slug = dialogMatch[1]
    const clip = dialogMatch[3]
    if (slug && clip) {
      return join(appRoot, 'content', 'dialog-audio', slug, clip)
    }
    return null
  }
  const rel = urlPath.replace(/^\//, '')
  return join(publicDir, rel)
}

function isJpegFile(fsPath: string): boolean {
  const head = readFileSync(fsPath, { flag: 'r' }).subarray(0, 2)
  return head.length === 2 && head[0] === JPEG_MAGIC[0] && head[1] === JPEG_MAGIC[1]
}

function jpegDimensions(fsPath: string): { width: number; height: number } | null {
  const buf = readFileSync(fsPath)
  return jpegDimensionsFromBuffer(buf)
}

function webpDimensions(fsPath: string): { width: number; height: number } | null {
  const buf = readFileSync(fsPath)
  return webpDimensionsFromBuffer(buf)
}

/** Größen-Warnschwelle je Dateityp — aligned mit MPZ-Upload-Regeln (#147), nicht Raumbild-Flat. */
export function sizeWarnThresholdForPath(urlPath: string): number {
  const lower = urlPath.toLowerCase()
  if (lower.endsWith('.mp4')) return UPLOAD_RULES.video.maxBytes
  if (/\.(mp3|m4a)$/.test(lower)) return UPLOAD_RULES.audio.maxBytes
  if (lower.endsWith('.wav')) return UPLOAD_RULES.audio.maxBytes
  if (/\.(md|txt)$/.test(lower)) return UPLOAD_RULES.text.maxBytes
  if (/\.webp$/.test(lower)) return UPLOAD_RULES.foto.maxBytes
  return FLAT_MAX_BYTES
}

function checkPanorama360Ratio(
  label: string,
  urlPath: string,
  dims: { width: number; height: number },
  errors: string[],
): void {
  const ratio = dims.width / dims.height
  if (Math.abs(ratio - 2) > PANO360_RATIO_TOLERANCE) {
    errors.push(
      `${label}: ${urlPath} hat Seitenverhältnis ${ratio.toFixed(2)}:1 (erwartet 2:1, ${dims.width}×${dims.height})`,
    )
  }
}

function checkPanorama360Asset(
  label: string,
  urlPath: string,
  fsPath: string,
  errors: string[],
  warnings: string[],
): void {
  const errorsBefore = errors.length
  checkJpegAsset(label, urlPath, fsPath, errors, warnings, PANO360_MAX_BYTES)
  if (errors.length > errorsBefore) {
    return
  }
  const dims = jpegDimensions(fsPath)
  if (!dims) {
    errors.push(`${label}: ${urlPath} — JPEG-Dimensionen nicht lesbar`)
    return
  }
  checkPanorama360Ratio(label, urlPath, dims, errors)
}

function checkPanorama360WebpAsset(
  label: string,
  urlPath: string,
  fsPath: string,
  errors: string[],
  warnings: string[],
): void {
  let st
  try {
    st = statSync(fsPath)
  } catch {
    errors.push(`${label}: Datei fehlt — ${urlPath}`)
    return
  }
  if (st.size < MIN_JPEG_BYTES) {
    errors.push(
      `${label}: ${urlPath} ist zu klein (${st.size} B) — vermutlich leere Datei`,
    )
    return
  }
  if (st.size > PANO360_MAX_BYTES) {
    warnings.push(
      `${label}: ${urlPath} ist groß (${formatRaumbildBytes(st.size)}, Schwellwert ${formatRaumbildBytes(PANO360_MAX_BYTES)})`,
    )
  }
  const dims = webpDimensions(fsPath)
  if (!dims) {
    errors.push(`${label}: ${urlPath} — WebP-Dimensionen nicht lesbar`)
    return
  }
  checkPanorama360Ratio(label, urlPath, dims, errors)
}

function checkJpegAsset(
  label: string,
  urlPath: string,
  fsPath: string,
  errors: string[],
  warnings: string[],
  warnBytes = FLAT_MAX_BYTES,
): void {
  let st
  try {
    st = statSync(fsPath)
  } catch {
    return
  }
  if (st.size < MIN_JPEG_BYTES) {
    errors.push(
      `${label}: ${urlPath} ist zu klein (${st.size} B) — vermutlich LFS-Pointer oder leere Datei`,
    )
    return
  }
  if (!isJpegFile(fsPath)) {
    const peek = readFileSync(fsPath, 'utf8').slice(0, 80)
    if (peek.startsWith(LFS_POINTER_PREFIX)) {
      errors.push(
        `${label}: ${urlPath} ist ein Git-LFS-Pointer — lokal „git lfs pull“ oder Build ohne Smudge`,
      )
    } else {
      errors.push(`${label}: ${urlPath} ist keine gültige JPEG-Datei (Magic-Bytes fehlen)`)
    }
    return
  }
  if (st.size > warnBytes) {
    warnings.push(
      `${label}: ${urlPath} ist groß (${formatRaumbildBytes(st.size)}, Schwellwert ${formatRaumbildBytes(warnBytes)})`,
    )
  }
}

function checkPath(
  label: string,
  urlPath: string,
  appRoot: string,
  errors: string[],
  warnings: string[],
  checkFiles: boolean,
): void {
  const fsPath = resolveAssetPath(appRoot, urlPath)
  if (!fsPath) {
    errors.push(`${label}: ungültiger Pfad "${urlPath}"`)
    return
  }
  if (!checkFiles) {
    return
  }
  if (!existsSync(fsPath)) {
    errors.push(`${label}: Datei fehlt — ${urlPath}`)
    return
  }
  if (/\.jpe?g$/i.test(fsPath)) {
    checkJpegAsset(label, urlPath, fsPath, errors, warnings)
    return
  }
  try {
    const st = statSync(fsPath)
    const warnBytes = sizeWarnThresholdForPath(urlPath)
    if (st.size > warnBytes) {
      warnings.push(
        `${label}: ${urlPath} ist groß (${formatRaumbildBytes(st.size)}, Schwellwert ${formatRaumbildBytes(warnBytes)})`,
      )
    }
  } catch {
    /* ignore */
  }
}

export function validateStationAssets(
  stationsFile: StationsFile,
  { appRoot, checkFiles = true }: ValidateStationAssetsOptions,
): ValidateStationAssetsResult {
  const errors: string[] = []
  const warnings: string[] = []
  const stations = stationsFile.stations

  if (!Array.isArray(stations)) {
    errors.push('stations.json: stations ist kein Array')
    return { errors, warnings }
  }

  for (const st of stations) {
    const slug = typeof st.slug === 'string' ? st.slug : '?'
    if (typeof st.bild === 'string') {
      checkPath(`Station ${slug} (bild)`, st.bild, appRoot, errors, warnings, checkFiles)
    }
    if (st.viewer === 'equirectangular' && typeof st.panorama360 === 'string') {
      const fsPath = resolveAssetPath(appRoot, st.panorama360)
      if (!fsPath) {
        errors.push(`Station ${slug} (panorama360): ungültiger Pfad "${st.panorama360}"`)
      } else if (!checkFiles) {
        /* Struktur-Modus: Pfad-Auflösung reicht */
      } else if (!existsSync(fsPath)) {
        errors.push(`Station ${slug} (panorama360): Datei fehlt — ${st.panorama360}`)
      } else if (/\.jpe?g$/i.test(fsPath)) {
        checkPanorama360Asset(
          `Station ${slug} (panorama360)`,
          st.panorama360,
          fsPath,
          errors,
          warnings,
        )
      } else if (/\.webp$/i.test(fsPath)) {
        checkPanorama360WebpAsset(
          `Station ${slug} (panorama360)`,
          st.panorama360,
          fsPath,
          errors,
          warnings,
        )
      } else {
        checkPath(`Station ${slug} (panorama360)`, st.panorama360, appRoot, errors, warnings, checkFiles)
      }
    }
    const medien = Array.isArray(st.medien) ? st.medien : []
    for (const m of medien) {
      if (m?.quelle && typeof m.quelle === 'string' && m.quelle.startsWith('/')) {
        checkPath(`Station ${slug} (medium ${m.id ?? '?'})`, m.quelle, appRoot, errors, warnings, checkFiles)
      }
      if (m?.poster && typeof m.poster === 'string' && m.poster.startsWith('/')) {
        checkPath(
          `Station ${slug} (medium ${m.id ?? '?'} poster)`,
          m.poster,
          appRoot,
          errors,
          warnings,
          checkFiles,
        )
      }
      if (m?.thumbnail && typeof m.thumbnail === 'string' && m.thumbnail.startsWith('/')) {
        checkPath(
          `Station ${slug} (medium ${m.id ?? '?'} thumbnail)`,
          m.thumbnail,
          appRoot,
          errors,
          warnings,
          checkFiles,
        )
      }
    }
    const hotspots = Array.isArray(st.hotspots) ? st.hotspots : []
    for (const hs of hotspots) {
      if (hs?.icon && typeof hs.icon === 'string' && hs.icon.startsWith('/')) {
        checkPath(`Station ${slug} (hotspot ${hs.id ?? '?'} icon)`, hs.icon, appRoot, errors, warnings, checkFiles)
      }
    }
    const hotspots360 = Array.isArray(st.hotspots360) ? st.hotspots360 : []
    for (const hs of hotspots360) {
      if (hs?.icon && typeof hs.icon === 'string' && hs.icon.startsWith('/')) {
        checkPath(
          `Station ${slug} (hotspot360 ${hs.id ?? '?'} icon)`,
          hs.icon,
          appRoot,
          errors,
          warnings,
          checkFiles,
        )
      }
    }
    const dialogSegs = st.dialog?.segmente
    if (Array.isArray(dialogSegs)) {
      for (const seg of dialogSegs) {
        if (seg?.quelle && typeof seg.quelle === 'string' && seg.quelle.startsWith('/')) {
          checkPath(`Station ${slug} (dialog ${seg.id ?? '?'})`, seg.quelle, appRoot, errors, warnings, checkFiles)
        }
      }
    }
  }

  return { errors, warnings }
}

const isMain =
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url

if (isMain) {
  const scriptDir = dirname(fileURLToPath(import.meta.url))
  const appRoot = join(scriptDir, '..')
  const stationsPath = join(appRoot, 'data', 'stations.json')
  const raw = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile
  const { errors, warnings } = validateStationAssets(raw, { appRoot })
  for (const w of warnings) {
    console.warn(w)
  }
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(e)
    }
    console.error('\nvalidate:stations fehlgeschlagen.')
    process.exit(1)
  }
  console.log(
    'validate:stations OK — alle referenzierten Dateien (public/ und content/) vorhanden.',
  )
}
