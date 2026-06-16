import { existsSync } from 'node:fs'
import { copyFile, mkdir, open, stat, unlink, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import {
  createMpzContentIo,
  type MpzContentIo,
} from '@/lib/mpz-content-io'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { Medium } from '@/lib/types'
import {
  HEADER_SLICE_BYTES,
  MpzUploadError,
  UPLOAD_RULES,
  getUploadFolder,
  isUploadTyp,
  sanitizeFilename,
  slugifyId,
  validateUpload,
  type UploadTyp,
} from '@/lib/mpz-upload-rules'

export { MpzUploadError } from '@/lib/mpz-upload-rules'
export type { UploadTyp } from '@/lib/mpz-upload-rules'

export type CollisionMode = 'rename' | 'replace' | 'reject'

/**
 * Quelle der Mediendatei. Union statt fixem Buffer (Pre-Mortem-Befund #2): die CLI
 * übergibt einen lokalen `sourcePath` (kein 150-MB-Read in den RAM), die API übergibt
 * vorerst einen `buffer`. Validierung läuft in beiden Fällen über einen Header-Slice.
 */
export type IngestSource = { buffer: Buffer } | { sourcePath: string }

export interface IngestMediumInput {
  slug: string
  typ: UploadTyp
  source: IngestSource
  originalName: string
  id?: string
  untertitel?: string
  /**
   * Disk-/Dateinamen-Kollision. KEIN Default in der Domain — der Aufrufer setzt ihn
   * (Befund #5): CLI nutzt 'reject' (Hard-Error wie bisher), API/UI nutzen 'rename'.
   */
  collision: CollisionMode
  /** true → JSON unverändert lassen (CLI --no-append). */
  skipJson?: boolean
}

export interface IngestMediumResult {
  medium: Medium
  quelle: string
  filename: string
  destPath: string
  jsonWritten: boolean
}

const HUB_SLUGS = new Set(Object.keys(HUB_SLUG_MAP))

async function readHeaderSlice(source: IngestSource): Promise<{
  headerSlice: Buffer
  byteLength: number
}> {
  if ('buffer' in source) {
    return {
      headerSlice: source.buffer.subarray(0, HEADER_SLICE_BYTES),
      byteLength: source.buffer.length,
    }
  }
  // Datei nur am Kopf lesen + statSync-Größe — nie die volle Datei im RAM (Befund #2).
  const { size } = await stat(source.sourcePath)
  const fh = await open(source.sourcePath, 'r')
  try {
    const buf = Buffer.alloc(Math.min(HEADER_SLICE_BYTES, size))
    await fh.read(buf, 0, buf.length, 0)
    return { headerSlice: buf, byteLength: size }
  } finally {
    await fh.close()
  }
}

async function persistFile(source: IngestSource, destPath: string): Promise<void> {
  if ('buffer' in source) {
    await writeFile(destPath, source.buffer)
    return
  }
  await copyFile(source.sourcePath, destPath)
}

function uniqueDiskPath(destDir: string, filename: string): string {
  const ext = extname(filename)
  const stem = filename.slice(0, filename.length - ext.length)
  let candidate = filename
  let n = 2
  while (existsSync(join(destDir, candidate))) {
    candidate = `${stem}-${n}${ext}`
    n += 1
  }
  return join(destDir, candidate)
}

function uniqueMediumId(existing: Set<string>, base: string): string {
  if (!existing.has(base)) return base
  let n = 2
  while (existing.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

/**
 * Gemeinsamer Ingest-Layer für CLI, API und Studio-UI (DRY, #147 / ADR-022).
 *
 * Ablauf: Validierung (Header-Slice) → Zielpfad/Kollision → Datei schreiben →
 * Ziel-Existenz prüfen → JSON (strict, validateAssets:false) → bei JSON-Fehler
 * Kompensation (geschriebene Datei löschen).
 */
export async function ingestMediumFile(
  input: IngestMediumInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<IngestMediumResult> {
  if (!isUploadTyp(input.typ)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Typ "${input.typ}" nicht unterstützt. Erlaubt: ${Object.keys(UPLOAD_RULES).join(', ')}.`,
    )
  }
  if (!HUB_SLUGS.has(input.slug)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Unbekannter slug "${input.slug}". Erlaubt: ${[...HUB_SLUGS].join(', ')}.`,
    )
  }

  const { headerSlice, byteLength } = await readHeaderSlice(input.source)
  await validateUpload({
    typ: input.typ,
    headerSlice,
    byteLength,
    originalName: input.originalName,
  })

  const folder = getUploadFolder(input.typ)
  const filename = sanitizeFilename(input.originalName, input.typ)
  const { appRoot } = io.getPaths()
  const destDir = join(appRoot, 'public', 'media', input.slug, folder)
  await mkdir(destDir, { recursive: true })

  let destPath = join(destDir, filename)
  let finalFilename = filename
  if (existsSync(destPath)) {
    if (input.collision === 'reject') {
      throw new MpzUploadError(
        'COLLISION',
        `Zieldatei existiert bereits: ${input.slug}/${folder}/${filename}`,
      )
    }
    if (input.collision === 'rename') {
      destPath = uniqueDiskPath(destDir, filename)
      finalFilename = destPath.slice(destDir.length + 1)
    }
    // 'replace' → destPath bleibt, Datei wird überschrieben
  }

  const quelle = `/media/${input.slug}/${folder}/${finalFilename}`

  await persistFile(input.source, destPath)

  // Gezielte Einzelprüfung statt globalem validateAssets-Gate (Befund #4):
  // ein fremder Broken-Reference in stations.json darf diesen Upload nicht killen.
  if (!existsSync(destPath)) {
    throw new MpzUploadError('IO', `Datei konnte nicht geschrieben werden: ${quelle}`)
  }

  const medium: Medium = {
    id: '',
    typ: input.typ,
    quelle,
  }
  if (input.untertitel?.trim()) {
    medium.untertitel = input.untertitel.trim()
  }
  if (input.typ === 'video') {
    medium.videoSource = 'upload'
  }

  if (input.skipJson) {
    medium.id = input.id?.trim() || slugifyId(`${input.slug}-${stemOf(finalFilename)}`)
    return { medium, quelle, filename: finalFilename, destPath, jsonWritten: false }
  }

  let data
  try {
    data = await io.readStations()
  } catch (err) {
    await safeUnlink(destPath)
    throw err
  }

  const station = data.stations.find((s) => s.slug === input.slug)
  if (!station) {
    await safeUnlink(destPath)
    throw new MpzUploadError(
      'VALIDATION',
      `Station "${input.slug}" nicht in stations.json gefunden.`,
    )
  }
  if (!Array.isArray(station.medien)) {
    station.medien = []
  }

  const existingIds = new Set(station.medien.map((m) => m.id))
  const requestedId = input.id?.trim()
  if (requestedId) {
    if (existingIds.has(requestedId)) {
      await safeUnlink(destPath)
      throw new MpzUploadError(
        'COLLISION',
        `medium.id "${requestedId}" existiert bereits in Station "${input.slug}".`,
      )
    }
    medium.id = requestedId
  } else {
    const base = slugifyId(`${input.slug}-${stemOf(finalFilename)}`)
    medium.id = uniqueMediumId(existingIds, base)
  }

  station.medien.push(medium)

  try {
    await io.writeStations(data, {
      strict: true,
      validateAssets: false,
      canonicalize: false,
      makeBackup: true,
    })
  } catch (err) {
    // Kompensation: gerade geschriebene Datei wieder entfernen (Befund #6).
    await safeUnlink(destPath)
    throw err
  }

  return { medium, quelle, filename: finalFilename, destPath, jsonWritten: true }
}

function stemOf(filename: string): string {
  return filename.slice(0, filename.length - extname(filename).length)
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore — Orphan-Cleanup via Folge-Task (clean-orphans CLI), siehe Doku */
  }
}
