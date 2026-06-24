import { existsSync, readdirSync } from 'node:fs'
import { mkdir, readdir, rename, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import {
  buildClipName,
  dialogApiQuelle,
  dialogAudioFsPath,
} from '@/lib/dialog-audio'
import { segmentHasAudio } from '@/lib/dialog-display'
import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
  resetMpzWriteLockForTests,
} from '@/lib/mpz-content-io'
import { runMpzStudioValidation, type MpzValidationReport } from '@/lib/mpz-studio-overview'
import {
  type IngestSource,
  persistFile,
  readHeaderSlice,
} from '@/lib/mpz-medium-ingest'
import { getHubSlugOrder, isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { DialogRolle, Station } from '@/lib/types'
import { HEADER_SLICE_BYTES, MpzUploadError } from '@/lib/mpz-upload-rules'

export { MpzUploadError } from '@/lib/mpz-upload-rules'

const MB = 1024 * 1024
const MAX_DIALOG_WAV_BYTES = 15 * MB
const MIN_WAV_BYTES = 1024
const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1'

export type DialogSegmentState = 'ok' | 'fehlt' | 'drift' | 'leer' | 'text-only'

export interface IngestDialogClipInput {
  slug: string
  segmentIndex: number
  source: IngestSource
  originalName: string
  collision?: 'replace' | 'reject'
  overrideQuelleDrift?: boolean
}

export interface IngestDialogClipResult {
  clip: string
  quelle: string
  destPath: string
  segmentId: string
  jsonWritten: boolean
  mtime?: string | null
  validation?: MpzValidationReport
}

export interface DialogSegmentAudit {
  segmentIndex: number
  segmentId: string
  rolle: DialogRolle
  textPreview: string
  expectedClip: string
  quelle?: string
  fileExists: boolean
  quelleMatchesConvention: boolean
  state: DialogSegmentState
}

export interface DialogAudioAuditResult {
  segments: DialogSegmentAudit[]
  orphans: string[]
}

function textPreview(text: string): string {
  const t = text.trim()
  if (t.length <= 60) return t
  return `${t.slice(0, 60)}…`
}

export function deriveSegmentState(
  fileExists: boolean,
  quelleMatchesConvention: boolean,
): DialogSegmentState {
  if (fileExists && quelleMatchesConvention) return 'ok'
  if (!fileExists && quelleMatchesConvention) return 'leer'
  if (fileExists && !quelleMatchesConvention) return 'drift'
  return 'fehlt'
}

function isLfsPointer(headerSlice: Buffer, byteLength: number): boolean {
  if (byteLength < MIN_WAV_BYTES) return true
  const head = headerSlice.subarray(0, Math.min(headerSlice.length, 64)).toString('ascii')
  return head.startsWith(LFS_POINTER_PREFIX)
}

export async function validateDialogWavUpload(input: {
  headerSlice: Buffer
  byteLength: number
  originalName: string
}): Promise<void> {
  if (input.byteLength > MAX_DIALOG_WAV_BYTES) {
    throw new MpzUploadError(
      'VALIDATION',
      `Dialog-WAV zu groß (${input.byteLength} B, max. ${MAX_DIALOG_WAV_BYTES} B).`,
    )
  }
  if (isLfsPointer(input.headerSlice, input.byteLength)) {
    throw new MpzUploadError(
      'VALIDATION',
      'Datei ist zu klein oder ein Git-LFS-Pointer — bitte echte WAV-Datei verwenden.',
    )
  }
  const detected = await fileTypeFromBuffer(input.headerSlice.subarray(0, HEADER_SLICE_BYTES))
  if (!detected || detected.ext !== 'wav') {
    throw new MpzUploadError(
      'VALIDATION',
      'Nur WAV-Dateien erlaubt (Magic-Byte-Prüfung). mp3/m4a werden abgelehnt.',
    )
  }
}

export function auditDialogAudio(station: Station, appRoot: string): DialogAudioAuditResult {
  const slug = station.slug
  const segmente = station.dialog?.segmente
  if (!segmente?.length) {
    return { segments: [], orphans: [] }
  }

  const expectedClips = new Set<string>()
  const segments: DialogSegmentAudit[] = segmente.map((seg, segmentIndex) => {
    const expectedClip = buildClipName(segmentIndex, seg.rolle)
    if (!segmentHasAudio(seg)) {
      return {
        segmentIndex,
        segmentId: seg.id,
        rolle: seg.rolle,
        textPreview: textPreview(seg.text),
        expectedClip,
        fileExists: false,
        quelleMatchesConvention: false,
        state: 'text-only' as const,
      }
    }
    expectedClips.add(expectedClip)
    const expectedQuelle = dialogApiQuelle(slug, expectedClip)
    const destPath = dialogAudioFsPath(appRoot, slug, expectedClip)
    const fileExists = existsSync(destPath)
    const quelleMatchesConvention = seg.quelle === expectedQuelle
    return {
      segmentIndex,
      segmentId: seg.id,
      rolle: seg.rolle,
      textPreview: textPreview(seg.text),
      expectedClip,
      quelle: seg.quelle,
      fileExists,
      quelleMatchesConvention,
      state: deriveSegmentState(fileExists, quelleMatchesConvention),
    }
  })

  const dir = join(appRoot, 'content', 'dialog-audio', slug)
  return { segments, orphans: listOrphansSync(dir, expectedClips) }
}

function listOrphansSync(dir: string, expectedClips: Set<string>): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.wav') && !expectedClips.has(name))
    .sort()
}

export async function auditDialogAudioForSlug(
  slug: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<DialogAudioAuditResult> {
  if (!isHubSlug(slug)) {
    throw new MpzUploadError('VALIDATION', `Unbekannter slug "${slug}".`)
  }
  const data = await io.readStations()
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzUploadError('VALIDATION', `Station "${slug}" nicht gefunden.`)
  }
  if (!station.dialog?.segmente?.length) {
    return { segments: [], orphans: [] }
  }
  const { appRoot } = io.getPaths()
  const base = auditDialogAudio(station, appRoot)
  const dir = join(appRoot, 'content', 'dialog-audio', slug)
  const expectedClips = new Set(base.segments.map((s) => s.expectedClip))
  let orphans: string[] = []
  if (existsSync(dir)) {
    const names = await readdir(dir)
    orphans = names
      .filter((name) => name.endsWith('.wav') && !expectedClips.has(name))
      .sort()
  }
  return { segments: base.segments, orphans }
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

async function writeWavWithReplace(
  source: IngestSource,
  destPath: string,
  collision: 'replace' | 'reject',
): Promise<{ bakPath: string | null }> {
  const bakPath = `${destPath}.bak.wav`
  const tmpPath = `${destPath}.${process.pid}.tmp`
  const hadPrevious = existsSync(destPath)

  if (hadPrevious && collision === 'reject') {
    throw new MpzUploadError(
      'COLLISION',
      `Clip existiert bereits: ${destPath}`,
    )
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

async function rollbackWav(destPath: string, bakPath: string | null): Promise<void> {
  if (bakPath && existsSync(bakPath)) {
    if (existsSync(destPath)) await safeUnlink(destPath)
    await rename(bakPath, destPath)
  } else {
    await safeUnlink(destPath)
  }
}

async function ingestDialogClipInner(
  input: IngestDialogClipInput,
  io: MpzContentIo,
): Promise<IngestDialogClipResult> {
  const collision = input.collision ?? 'reject'

  if (!isHubSlug(input.slug)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Unbekannter slug "${input.slug}". Erlaubt: ${getHubSlugOrder().join(', ')}.`,
    )
  }

  const { headerSlice, byteLength } = await readHeaderSlice(input.source)
  await validateDialogWavUpload({
    headerSlice,
    byteLength,
    originalName: input.originalName,
  })

  const data = await io.readStations()
  const station = data.stations.find((s) => s.slug === input.slug)
  if (!station?.dialog?.segmente?.length) {
    throw new MpzUploadError(
      'VALIDATION',
      `Station "${input.slug}" hat keinen Dialog (dialog.segmente).`,
    )
  }

  const { segmente } = station.dialog
  if (input.segmentIndex < 0 || input.segmentIndex >= segmente.length) {
    throw new MpzUploadError(
      'VALIDATION',
      `segmentIndex ${input.segmentIndex} außerhalb (0–${segmente.length - 1}).`,
    )
  }

  const segment = segmente[input.segmentIndex]!
  const clip = buildClipName(input.segmentIndex, segment.rolle)
  const expectedQuelle = dialogApiQuelle(input.slug, clip)

  if (
    segment.quelle &&
    segment.quelle !== expectedQuelle &&
    !input.overrideQuelleDrift
  ) {
    throw new MpzUploadError(
      'VALIDATION',
      `segment.quelle weicht ab (DRIFT): "${segment.quelle}" ≠ "${expectedQuelle}". ` +
        'Upload mit overrideQuelleDrift erlauben.',
    )
  }

  const { appRoot } = io.getPaths()
  const destPath = dialogAudioFsPath(appRoot, input.slug, clip)

  const { bakPath } = await writeWavWithReplace(input.source, destPath, collision)

  segment.quelle = expectedQuelle

  let writeResult: Awaited<ReturnType<MpzContentIo['writeStations']>>
  let validation: MpzValidationReport
  try {
    writeResult = await io.writeStations(data, {
      strict: true,
      validateAssets: false,
      canonicalize: false,
      makeBackup: true,
      postValidate: true,
      touchedSlugs: [input.slug],
    })
    validation = await runMpzStudioValidation(io)
  } catch (err) {
    await rollbackWav(destPath, bakPath)
    throw err
  }

  if (bakPath && existsSync(bakPath)) {
    await safeUnlink(bakPath)
  }

  return {
    clip,
    quelle: expectedQuelle,
    destPath,
    segmentId: segment.id,
    jsonWritten: true,
    mtime: writeResult.mtime,
    validation,
  }
}

export async function ingestDialogClip(
  input: IngestDialogClipInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<IngestDialogClipResult> {
  return withMpzWriteLock(() => ingestDialogClipInner(input, io))
}

export interface RemoveDialogClipResult {
  slug: string
  segmentIndex: number
  expectedClip: string
  fileDeleted: boolean
}

// FIXME: MpzUploadError nutzt 'VALIDATION' statt 'VALIDATION_FAILED' (error-conventions.mdc).
// Normalisierung mit #199-Tech-Debt — hier modul-konsistent mit ingestDialogClip belassen.

export async function removeDialogClip(
  slug: string,
  segmentIndex: number,
  io: MpzContentIo = createMpzContentIo(),
): Promise<RemoveDialogClipResult> {
  if (!isHubSlug(slug)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Unbekannter slug "${slug}". Erlaubt: ${getHubSlugOrder().join(', ')}.`,
    )
  }

  const data = await io.readStations()
  const station = data.stations.find((s) => s.slug === slug)
  if (!station?.dialog?.segmente?.length) {
    throw new MpzUploadError(
      'VALIDATION',
      `Station "${slug}" hat keinen Dialog (dialog.segmente).`,
    )
  }

  const { segmente } = station.dialog
  if (segmentIndex < 0 || segmentIndex >= segmente.length) {
    throw new MpzUploadError(
      'VALIDATION',
      `segmentIndex ${segmentIndex} außerhalb (0–${segmente.length - 1}).`,
    )
  }

  const segment = segmente[segmentIndex]!
  const expectedClip = buildClipName(segmentIndex, segment.rolle)
  const { appRoot } = io.getPaths()
  const destPath = dialogAudioFsPath(appRoot, slug, expectedClip)

  let fileDeleted = false
  if (existsSync(destPath)) {
    await unlink(destPath)
    fileDeleted = true
  }

  return { slug, segmentIndex, expectedClip, fileDeleted }
}

/** Nur für Tests: Queue zurücksetzen. */
export function resetDialogIngestLockForTests(): void {
  resetMpzWriteLockForTests()
}
