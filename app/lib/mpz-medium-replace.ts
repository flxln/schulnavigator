import { existsSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  type IngestSource,
  persistFile,
  readHeaderSlice,
  uniqueDiskPath,
} from '@/lib/mpz-medium-ingest'
import {
  MpzStationMedienError,
  resolvePublicMediaPath,
  tryDeleteMediaFile,
} from '@/lib/mpz-station-medien'
import { runMpzStudioValidation, type MpzValidationReport } from '@/lib/mpz-studio-overview'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import {
  getUploadFolder,
  isUploadTyp,
  sanitizeFilename,
  validateUpload,
  type UploadTyp,
} from '@/lib/mpz-upload-rules'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { Medium, Station, StationsFile } from '@/lib/types'

export interface ReplaceMediumFileInput {
  slug: string
  mediumId: string
  source: IngestSource
  originalName: string
}

export interface ReplaceMediumFileResult {
  medium: Medium
  quelle: string
  previousQuelle: string
  fileReplaced: boolean
  previousFileDeleted: boolean
  mtime: string | null
  validation?: MpzValidationReport
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!isHubSlug(slug)) {
    throw new MpzStationMedienError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

function normalizeUploadExtension(ext: string, typ: UploadTyp): string {
  const lower = ext.toLowerCase()
  if (typ === 'foto' && lower === '.jpeg') {
    return '.jpg'
  }
  return lower
}

function extensionFromQuelle(quelle: string, typ: UploadTyp): string {
  return normalizeUploadExtension(extname(quelle), typ)
}

function isQuelleSharedByOtherMedium(
  station: Station,
  mediumId: string,
  quelle: string,
): boolean {
  return (station.medien ?? []).some((m) => m.id !== mediumId && m.quelle === quelle)
}

function assertReplaceAllowed(medium: Medium): UploadTyp {
  if (medium.typ === 'link' || medium.typ === 'embed') {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      `Datei-Ersetzen ist für typ "${medium.typ}" nicht erlaubt.`,
    )
  }
  if (medium.typ === 'video' && medium.videoSource === 'youtube') {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      'Datei-Ersetzen ist für YouTube-Videos nicht erlaubt.',
    )
  }
  if (!isUploadTyp(medium.typ)) {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      `Datei-Ersetzen ist für typ "${medium.typ}" nicht erlaubt.`,
    )
  }
  return medium.typ
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

function buildUpdatedMedium(existing: Medium, nextQuelle: string): Medium {
  const updated: Medium = { ...existing, quelle: nextQuelle }
  if (existing.typ === 'video' && existing.videoSource === undefined) {
    updated.videoSource = 'upload'
  }
  return updated
}

function patchStationMedium(
  data: StationsFile,
  slug: string,
  mediumId: string,
  updatedMedium: Medium,
): { stations: StationsFile; station: Station } {
  const station = findHubStation(data, slug)
  const mediumIndex = station.medien.findIndex((m) => m.id === mediumId)
  if (mediumIndex === -1) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Medium "${mediumId}" nicht in Station "${slug}" gefunden.`,
    )
  }
  const nextMedien = [...station.medien]
  nextMedien[mediumIndex] = updatedMedium
  const nextStation: Station = { ...station, medien: nextMedien }
  const nextStations: StationsFile = {
    stations: data.stations.map((s) => (s.slug === slug ? nextStation : s)),
  }
  return { stations: nextStations, station: nextStation }
}

async function resolveNewDestPath(
  appRoot: string,
  slug: string,
  typ: UploadTyp,
  originalName: string,
  previousQuelle: string,
  avoidPreviousPath: boolean,
): Promise<{ destPath: string; quelle: string }> {
  const folder = getUploadFolder(typ)
  const filename = sanitizeFilename(originalName, typ)
  const destDir = join(appRoot, 'public', 'media', slug, folder)
  await mkdir(destDir, { recursive: true })

  let destPath = join(destDir, filename)
  const previousFs = resolvePublicMediaPath(appRoot, previousQuelle, slug)
  if (avoidPreviousPath && destPath === previousFs) {
    destPath = uniqueDiskPath(destDir, filename)
  } else if (existsSync(destPath) && destPath !== previousFs) {
    destPath = uniqueDiskPath(destDir, filename)
  }

  const finalFilename = basename(destPath)
  const quelle = `/media/${slug}/${folder}/${finalFilename}`
  return { destPath, quelle }
}

async function writeNewPathFile(source: IngestSource, destPath: string): Promise<void> {
  const tmpPath = `${destPath}.${process.pid}.tmp`
  try {
    await persistFile(source, tmpPath)
    if (!existsSync(tmpPath)) {
      throw new MpzUploadError('IO', `Datei konnte nicht geschrieben werden: ${destPath}`)
    }
    await rename(tmpPath, destPath)
    if (!existsSync(destPath)) {
      throw new MpzUploadError('IO', `Datei konnte nicht geschrieben werden: ${destPath}`)
    }
  } catch (err) {
    await safeUnlink(tmpPath)
    throw err
  }
}

async function finalizeInPlaceReplace(destPath: string, tmpPath: string): Promise<void> {
  const bakPath = `${destPath}.bak`
  const hadPrevious = existsSync(destPath)
  let movedToBak = false

  try {
    if (hadPrevious) {
      if (existsSync(bakPath)) {
        await safeUnlink(bakPath)
      }
      await rename(destPath, bakPath)
      movedToBak = true
    }
    await rename(tmpPath, destPath)
  } catch (err) {
    if (movedToBak && existsSync(bakPath)) {
      if (existsSync(destPath)) {
        await safeUnlink(destPath)
      }
      await rename(bakPath, destPath)
    }
    throw err
  }

  if (movedToBak && existsSync(bakPath)) {
    await safeUnlink(bakPath)
  }
}

export async function replaceStationMediumFile(
  input: ReplaceMediumFileInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<ReplaceMediumFileResult> {
  return withMpzWriteLock(() => replaceStationMediumFileInner(input, io))
}

async function replaceStationMediumFileInner(
  input: ReplaceMediumFileInput,
  io: MpzContentIo,
): Promise<ReplaceMediumFileResult> {
  const data = await io.readStations()
  const station = findHubStation(data, input.slug)
  const existing = station.medien.find((m) => m.id === input.mediumId)
  if (!existing) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Medium "${input.mediumId}" nicht in Station "${input.slug}" gefunden.`,
    )
  }

  const uploadTyp = assertReplaceAllowed(existing)
  const previousQuelle = existing.quelle

  const { headerSlice, byteLength } = await readHeaderSlice(input.source)
  await validateUpload({
    typ: uploadTyp,
    headerSlice,
    byteLength,
    originalName: input.originalName,
  })

  const { appRoot } = io.getPaths()
  const uploadExt = normalizeUploadExtension(
    extname(sanitizeFilename(input.originalName, uploadTyp)),
    uploadTyp,
  )
  const existingExt = extensionFromQuelle(previousQuelle, uploadTyp)
  const sharedQuelle = isQuelleSharedByOtherMedium(station, input.mediumId, previousQuelle)
  const extensionChanges = uploadExt !== existingExt
  const useNewPath = extensionChanges || sharedQuelle

  let nextQuelle = previousQuelle
  let newDestPath: string | null = null
  let inPlaceTmpPath: string | null = null
  let inPlaceDestPath: string | null = null

  if (useNewPath) {
    const resolved = await resolveNewDestPath(
      appRoot,
      input.slug,
      uploadTyp,
      input.originalName,
      previousQuelle,
      sharedQuelle,
    )
    newDestPath = resolved.destPath
    nextQuelle = resolved.quelle
    await writeNewPathFile(input.source, newDestPath)
  } else {
    inPlaceDestPath = resolvePublicMediaPath(appRoot, previousQuelle, input.slug)
    if (!inPlaceDestPath) {
      throw new MpzUploadError(
        'VALIDATION',
        `Ungültiger quelle-Pfad für Replace: ${previousQuelle}`,
      )
    }
    inPlaceTmpPath = `${inPlaceDestPath}.${process.pid}.tmp`
    await persistFile(input.source, inPlaceTmpPath)
    if (!existsSync(inPlaceTmpPath)) {
      throw new MpzUploadError('IO', `Datei konnte nicht geschrieben werden: ${inPlaceDestPath}`)
    }
  }

  const updatedMedium = buildUpdatedMedium(existing, nextQuelle)
  const patched = patchStationMedium(data, input.slug, input.mediumId, updatedMedium)

  let writeResult: Awaited<ReturnType<MpzContentIo['writeStations']>>
  let validation: MpzValidationReport
  try {
    writeResult = await io.writeStations(patched.stations, {
      strict: true,
      validateAssets: false,
      canonicalize: false,
      makeBackup: true,
      postValidate: true,
      touchedSlugs: [input.slug],
    })
    validation = await runMpzStudioValidation(io)
  } catch (err) {
    if (useNewPath && newDestPath) {
      await safeUnlink(newDestPath)
    } else if (inPlaceTmpPath) {
      await safeUnlink(inPlaceTmpPath)
    }
    throw err
  }

  let previousFileDeleted = false

  if (useNewPath) {
    const deleteResult = await tryDeleteMediaFile(
      appRoot,
      input.slug,
      previousQuelle,
      patched.station,
    )
    previousFileDeleted = deleteResult.fileDeleted
  } else if (inPlaceTmpPath && inPlaceDestPath) {
    await finalizeInPlaceReplace(inPlaceDestPath, inPlaceTmpPath)
  }

  return {
    medium: updatedMedium,
    quelle: nextQuelle,
    previousQuelle,
    fileReplaced: true,
    previousFileDeleted,
    mtime: writeResult.mtime,
    validation,
  }
}
