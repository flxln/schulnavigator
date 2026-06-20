import { existsSync } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import { basename, join } from 'node:path'
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
import { MpzStationMedienError, tryDeleteMediaFile } from '@/lib/mpz-station-medien'
import { runMpzStudioValidation, type MpzValidationReport } from '@/lib/mpz-studio-overview'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import { getUploadFolder, sanitizeFilename, validateUpload } from '@/lib/mpz-upload-rules'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { Medium, Station, StationsFile } from '@/lib/types'

export type MediumAssetField = 'thumbnail' | 'poster'

export interface UploadMediumAssetInput {
  slug: string
  mediumId: string
  field: MediumAssetField
  source: IngestSource
  originalName: string
}

export interface UploadMediumAssetResult {
  medium: Medium
  field: MediumAssetField
  path: string
  previousPath: string | null
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

function assertPosterAllowed(medium: Medium): void {
  if (medium.typ !== 'video') {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      `poster ist für typ "${medium.typ}" nicht erlaubt — nur video.`,
    )
  }
}

function readPreviousPath(medium: Medium, field: MediumAssetField): string | null {
  const raw = field === 'thumbnail' ? medium.thumbnail : medium.poster
  if (raw === undefined || raw === null || raw.trim() === '') {
    return null
  }
  return raw.trim()
}

function patchMediumAsset(
  data: StationsFile,
  slug: string,
  mediumId: string,
  field: MediumAssetField,
  path: string,
): { stations: StationsFile; station: Station; medium: Medium } {
  const station = findHubStation(data, slug)
  const mediumIndex = station.medien.findIndex((m) => m.id === mediumId)
  if (mediumIndex === -1) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Medium "${mediumId}" nicht in Station "${slug}" gefunden.`,
    )
  }

  const existing = station.medien[mediumIndex]!
  const updatedMedium: Medium = { ...existing, [field]: path }
  const nextMedien = [...station.medien]
  nextMedien[mediumIndex] = updatedMedium
  const nextStation: Station = { ...station, medien: nextMedien }
  const nextStations: StationsFile = {
    stations: data.stations.map((s) => (s.slug === slug ? nextStation : s)),
  }

  return { stations: nextStations, station: nextStation, medium: updatedMedium }
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

async function resolveDestPath(
  appRoot: string,
  slug: string,
  originalName: string,
): Promise<{ destPath: string; path: string }> {
  const folder = getUploadFolder('foto')
  const filename = sanitizeFilename(originalName, 'foto')
  const destDir = join(appRoot, 'public', 'media', slug, folder)
  await mkdir(destDir, { recursive: true })

  const destPath = uniqueDiskPath(destDir, filename)
  const finalFilename = basename(destPath)
  const path = `/media/${slug}/${folder}/${finalFilename}`
  return { destPath, path }
}

export async function uploadStationMediumAsset(
  input: UploadMediumAssetInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<UploadMediumAssetResult> {
  return withMpzWriteLock(() => uploadStationMediumAssetInner(input, io))
}

async function uploadStationMediumAssetInner(
  input: UploadMediumAssetInput,
  io: MpzContentIo,
): Promise<UploadMediumAssetResult> {
  const data = await io.readStations()
  const station = findHubStation(data, input.slug)
  const existing = station.medien.find((m) => m.id === input.mediumId)
  if (!existing) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Medium "${input.mediumId}" nicht in Station "${input.slug}" gefunden.`,
    )
  }

  if (input.field === 'poster') {
    assertPosterAllowed(existing)
  }

  const previousPath = readPreviousPath(existing, input.field)

  const { headerSlice, byteLength } = await readHeaderSlice(input.source)
  await validateUpload({
    typ: 'foto',
    headerSlice,
    byteLength,
    originalName: input.originalName,
  })

  const { appRoot } = io.getPaths()
  const { destPath, path } = await resolveDestPath(appRoot, input.slug, input.originalName)

  await persistFile(input.source, destPath)
  if (!existsSync(destPath)) {
    throw new MpzUploadError('IO', `Datei konnte nicht geschrieben werden: ${destPath}`)
  }

  const patched = patchMediumAsset(data, input.slug, input.mediumId, input.field, path)

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
    await safeUnlink(destPath)
    throw err
  }

  let previousFileDeleted = false
  if (previousPath) {
    const deleteResult = await tryDeleteMediaFile(
      appRoot,
      input.slug,
      previousPath,
      patched.station,
    )
    previousFileDeleted = deleteResult.fileDeleted
  }

  return {
    medium: patched.medium,
    field: input.field,
    path,
    previousPath,
    previousFileDeleted,
    mtime: writeResult.mtime,
    validation,
  }
}
