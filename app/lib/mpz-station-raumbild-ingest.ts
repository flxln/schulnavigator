import { existsSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { dirname, join, normalize } from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import {
  createMpzContentIo,
  type MpzContentIo,
  MpzContentIoError,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { readImageDimensions } from '@/lib/image-dimensions'
import { type IngestSource, persistFile } from '@/lib/mpz-medium-ingest'
import { runMpzStudioValidation, type MpzValidationReport } from '@/lib/mpz-studio-overview'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import { getHubSlugOrder, isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { Station, StationsFile } from '@/lib/types'

export type RaumbildVariant = 'flat' | 'pano360'
export type RaumbildCollisionMode = 'reject' | 'replace'

/** Harte Upload-Schranke für Flat — initial aus Display-Empfehlung 2,5:1, unabhängig evolvierbar. */
export const FLAT_UPLOAD_RATIO_MIN = 2.5

export const FLAT_MAX_BYTES = 500 * 1024
export const PANO360_MAX_BYTES = 4 * 1024 * 1024
export const MIN_RAUMBILD_BYTES = 1024
export const FLAT_RATIO_TOLERANCE = 0.02
export const PANO360_RATIO = 2
export const PANO360_RATIO_TOLERANCE = 0.02

const PANO360_EXTENSIONS = ['.jpg', '.webp'] as const

export interface IngestStationRaumbildInput {
  slug: string
  variant: RaumbildVariant
  source: IngestSource
  originalName: string
  collision: RaumbildCollisionMode
}

export interface RaumbildUploadResponse {
  station: Station
  mtime: string | null
  path: string
  variant: RaumbildVariant
  validation: MpzValidationReport
}

export function flatRaumbildPublicPath(slug: string): string {
  return `/stations/${slug}.jpg`
}

export function pano360RaumbildPublicPath(slug: string, ext: '.jpg' | '.webp'): string {
  return `/stations/360/${slug}${ext}`
}

export function resolveRaumbildFsPath(appRoot: string, publicPath: string): string | null {
  if (!publicPath.startsWith('/stations/')) {
    return null
  }
  const publicDir = normalize(join(appRoot, 'public'))
  const candidate = normalize(join(appRoot, 'public', publicPath.slice(1)))
  const publicPrefix = `${publicDir}/`
  if (candidate !== publicDir && !candidate.startsWith(publicPrefix)) {
    return null
  }
  return candidate
}

function ratioWithin(value: number, target: number, tolerance: number): boolean {
  return Math.abs(value - target) <= tolerance
}

export async function validateRaumbildUpload(input: {
  buffer: Buffer
  variant: RaumbildVariant
  originalName: string
}): Promise<{ ext: '.jpg' | '.webp' }> {
  const { buffer, variant, originalName } = input

  if (buffer.length <= 0) {
    throw new MpzUploadError('VALIDATION', 'Datei ist leer.')
  }
  if (buffer.length < MIN_RAUMBILD_BYTES) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Datei ist zu klein — vermutlich leer oder unvollständig.`,
    )
  }

  const maxBytes = variant === 'flat' ? FLAT_MAX_BYTES : PANO360_MAX_BYTES
  if (buffer.length > maxBytes) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Datei ist zu groß (max. ${maxBytes / 1024} KB für ${variant}).`,
    )
  }

  const detected = await fileTypeFromBuffer(buffer.subarray(0, Math.min(buffer.length, 4096)))
  const imageInfo = readImageDimensions(buffer)
  if (!imageInfo) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Bild-Dimensionen nicht lesbar.`,
    )
  }

  const { format, dimensions } = imageInfo
  const ratio = dimensions.width / dimensions.height

  if (variant === 'flat') {
    if (format !== 'jpeg' || detected?.ext !== 'jpg') {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: Flat-Raumbild muss JPEG sein.`,
      )
    }
    if (ratio < FLAT_UPLOAD_RATIO_MIN - FLAT_RATIO_TOLERANCE) {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: Seitenverhältnis ${ratio.toFixed(2)}:1 — mindestens ${FLAT_UPLOAD_RATIO_MIN}:1 erforderlich (${dimensions.width}×${dimensions.height}).`,
      )
    }
    return { ext: '.jpg' }
  }

  if (format === 'jpeg') {
    if (detected?.ext !== 'jpg') {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: 360°-Raumbild muss JPEG oder WebP sein.`,
      )
    }
    if (!ratioWithin(ratio, PANO360_RATIO, PANO360_RATIO_TOLERANCE)) {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: Seitenverhältnis ${ratio.toFixed(2)}:1 — erwartet 2:1 (${dimensions.width}×${dimensions.height}).`,
      )
    }
    return { ext: '.jpg' }
  }

  if (format === 'webp') {
    if (detected?.ext !== 'webp') {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: 360°-Raumbild muss JPEG oder WebP sein.`,
      )
    }
    if (!ratioWithin(ratio, PANO360_RATIO, PANO360_RATIO_TOLERANCE)) {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: Seitenverhältnis ${ratio.toFixed(2)}:1 — erwartet 2:1 (${dimensions.width}×${dimensions.height}).`,
      )
    }
    return { ext: '.webp' }
  }

  throw new MpzUploadError(
    'VALIDATION',
    `${originalName}: 360°-Raumbild muss JPEG oder WebP sein.`,
  )
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!isHubSlug(slug)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Unbekannter slug "${slug}". Erlaubt: ${getHubSlugOrder().join(', ')}.`,
    )
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzUploadError('VALIDATION', `Station "${slug}" fehlt in stations.json.`)
  }
  return station
}

function getExistingFlatPath(appRoot: string, slug: string, station: Station): string | null {
  const expected = flatRaumbildPublicPath(slug)
  const fsPath = resolveRaumbildFsPath(appRoot, expected)
  if (fsPath && existsSync(fsPath)) {
    return expected
  }
  if (station.bild && station.bild.startsWith('/stations/')) {
    const bildFs = resolveRaumbildFsPath(appRoot, station.bild)
    if (bildFs && existsSync(bildFs)) {
      return station.bild
    }
  }
  return null
}

function getExistingPano360Path(appRoot: string, slug: string, station: Station): string | null {
  if (station.panorama360?.startsWith('/stations/360/')) {
    const fsPath = resolveRaumbildFsPath(appRoot, station.panorama360)
    if (fsPath && existsSync(fsPath)) {
      return station.panorama360
    }
  }
  for (const ext of PANO360_EXTENSIONS) {
    const publicPath = pano360RaumbildPublicPath(slug, ext)
    const fsPath = resolveRaumbildFsPath(appRoot, publicPath)
    if (fsPath && existsSync(fsPath)) {
      return publicPath
    }
  }
  return null
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

async function writeRaumbildWithReplace(
  source: IngestSource,
  destPath: string,
  collision: RaumbildCollisionMode,
): Promise<{ bakPath: string | null }> {
  const bakPath = `${destPath}.bak`
  const tmpPath = `${destPath}.${process.pid}.tmp`
  const hadPrevious = existsSync(destPath)

  if (hadPrevious && collision === 'reject') {
    throw new MpzUploadError('COLLISION', `Raumbild existiert bereits: ${destPath}`)
  }

  let movedToBak = false
  if (hadPrevious && collision === 'replace') {
    if (existsSync(bakPath)) await safeUnlink(bakPath)
    await rename(destPath, bakPath)
    movedToBak = true
  }

  try {
    await mkdir(dirname(destPath), { recursive: true })
    await persistFile(source, tmpPath)
    await rename(tmpPath, destPath)
    return { bakPath: movedToBak ? bakPath : null }
  } catch (err) {
    await safeUnlink(tmpPath)
    if (movedToBak && existsSync(bakPath)) {
      if (existsSync(destPath)) await safeUnlink(destPath)
      await rename(bakPath, destPath)
    }
    throw err
  }
}

async function rollbackNewRaumbild(
  newDestPath: string,
  bakPath: string | null,
): Promise<void> {
  if (bakPath && existsSync(bakPath)) {
    if (existsSync(newDestPath)) await safeUnlink(newDestPath)
    await rename(bakPath, newDestPath)
  } else {
    await safeUnlink(newDestPath)
  }
}

export async function ingestStationRaumbild(
  input: IngestStationRaumbildInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<RaumbildUploadResponse> {
  return withMpzWriteLock(() => ingestStationRaumbildInner(input, io))
}

async function ingestStationRaumbildInner(
  input: IngestStationRaumbildInput,
  io: MpzContentIo,
): Promise<RaumbildUploadResponse> {
  const buffer =
    'buffer' in input.source
      ? input.source.buffer
      : (() => {
          throw new MpzUploadError('VALIDATION', 'Raumbild-Upload erfordert einen Buffer.')
        })()

  const { ext } = await validateRaumbildUpload({
    buffer,
    variant: input.variant,
    originalName: input.originalName,
  })

  const { appRoot } = io.getPaths()
  const data = await io.readStations()
  const station = findHubStation(data, input.slug)

  const newPublicPath =
    input.variant === 'flat'
      ? flatRaumbildPublicPath(input.slug)
      : pano360RaumbildPublicPath(input.slug, ext)

  const newDestPath = resolveRaumbildFsPath(appRoot, newPublicPath)
  if (!newDestPath) {
    throw new MpzUploadError('VALIDATION', 'Ungültiger Raumbild-Zielpfad.')
  }

  const existingPublicPath =
    input.variant === 'flat'
      ? getExistingFlatPath(appRoot, input.slug, station)
      : getExistingPano360Path(appRoot, input.slug, station)

  if (existingPublicPath && input.collision === 'reject') {
    throw new MpzUploadError(
      'COLLISION',
      `Raumbild existiert bereits für diese Station (${existingPublicPath}).`,
    )
  }

  const existingFsPath = existingPublicPath
    ? resolveRaumbildFsPath(appRoot, existingPublicPath)
    : null

  const sameDest = existingFsPath === newDestPath
  let bakPath: string | null = null

  if (sameDest) {
    const result = await writeRaumbildWithReplace(
      input.source,
      newDestPath,
      input.collision,
    )
    bakPath = result.bakPath
  } else {
    await mkdir(dirname(newDestPath), { recursive: true })
    const tmpPath = `${newDestPath}.${process.pid}.tmp`
    try {
      await persistFile(input.source, tmpPath)
      await rename(tmpPath, newDestPath)
    } catch (err) {
      await safeUnlink(tmpPath)
      throw err
    }
  }

  const nextStation: Station = { ...station }
  if (input.variant === 'flat') {
    nextStation.bild = newPublicPath
  } else {
    nextStation.panorama360 = newPublicPath
  }

  const nextStations = data.stations.map((s) =>
    s.slug === input.slug ? nextStation : s,
  )

  let writeResult: Awaited<ReturnType<MpzContentIo['writeStations']>>
  let validation: MpzValidationReport
  try {
    writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        postValidate: true,
        makeBackup: true,
        touchedSlugs: [input.slug],
      },
    )
    validation = await runMpzStudioValidation(io)
  } catch (err) {
    await rollbackNewRaumbild(newDestPath, bakPath)
    throw err
  }

  if (bakPath && existsSync(bakPath)) {
    await safeUnlink(bakPath)
  }

  if (
    input.variant === 'pano360' &&
    existingFsPath &&
    existingFsPath !== newDestPath &&
    existsSync(existingFsPath)
  ) {
    await safeUnlink(existingFsPath)
  }

  const written = nextStations.find((s) => s.slug === input.slug)
  if (!written) {
    throw new MpzUploadError('VALIDATION', `Station "${input.slug}" nicht gefunden.`)
  }

  return {
    station: written,
    mtime: writeResult.mtime,
    path: newPublicPath,
    variant: input.variant,
    validation,
  }
}

export { MpzContentIoError }
