import { existsSync, readdirSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  coachApiQuelle,
  coachAudioFsPath,
  COACH_MESSAGE_ID_RE,
  quelleMatchesCoachConvention,
} from '@/lib/coach-audio'
import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
  resetMpzWriteLockForTests,
} from '@/lib/mpz-content-io'
import { MpzCoachMessagesError } from '@/lib/mpz-coach-messages'
import { runMpzStudioValidation, type MpzValidationReport } from '@/lib/mpz-studio-overview'
import {
  type IngestSource,
  persistFile,
  readHeaderSlice,
} from '@/lib/mpz-medium-ingest'
import { validateDialogWavUpload } from '@/lib/mpz-dialog-audio-ingest'
import type { CoachMessage } from '@/lib/types'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export { MpzUploadError } from '@/lib/mpz-upload-rules'

export type CoachAudioState = 'ok' | 'fehlt' | 'drift' | 'leer'

export interface IngestCoachClipInput {
  messageId: string
  source: IngestSource
  originalName: string
  collision?: 'replace' | 'reject'
}

export interface IngestCoachClipResult {
  quelle: string
  destPath: string
  messageId: string
  mtime?: string | null
  validation?: MpzValidationReport
}

export interface CoachAudioAuditEntry {
  messageId: string
  quelle: string
  fileExists: boolean
  quelleMatchesConvention: boolean
  state: CoachAudioState
}

export interface CoachAudioAuditResult {
  entries: CoachAudioAuditEntry[]
  orphans: string[]
}

export function deriveCoachAudioState(
  fileExists: boolean,
  quelleMatchesConvention: boolean,
  hasQuelle: boolean,
): CoachAudioState {
  if (hasQuelle && fileExists && quelleMatchesConvention) return 'ok'
  if (hasQuelle && !fileExists && quelleMatchesConvention) return 'leer'
  if (!hasQuelle && fileExists) return 'fehlt'
  if (fileExists && !quelleMatchesConvention) return 'drift'
  return 'leer'
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
      `Coach-Clip existiert bereits: ${destPath}`,
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

export function auditCoachAudio(
  messages: readonly CoachMessage[],
  appRoot: string,
): CoachAudioAuditResult {
  const coachDir = join(appRoot, 'content', 'coach-audio')
  const expectedIds = new Set(messages.map((m) => m.id))
  const entries: CoachAudioAuditEntry[] = messages.map((message) => {
    const destPath = coachAudioFsPath(appRoot, message.id)
    const fileExists = existsSync(destPath)
    const quelle = message.quelle ?? ''
    const hasQuelle = quelle.length > 0
    const quelleMatchesConvention = hasQuelle
      ? quelleMatchesCoachConvention(quelle, message.id)
      : false
    return {
      messageId: message.id,
      quelle,
      fileExists,
      quelleMatchesConvention,
      state: deriveCoachAudioState(fileExists, quelleMatchesConvention, hasQuelle),
    }
  })

  let orphans: string[] = []
  try {
    orphans = readdirSync(coachDir)
      .filter((name) => name.endsWith('.wav'))
      .map((name) => name.replace(/\.wav$/, ''))
      .filter((id) => !expectedIds.has(id))
      .sort()
  } catch {
    orphans = []
  }

  return { entries, orphans }
}

async function ingestCoachClipInner(
  input: IngestCoachClipInput,
  io: MpzContentIo,
): Promise<IngestCoachClipResult> {
  const messageId = input.messageId.trim()
  if (!COACH_MESSAGE_ID_RE.test(messageId)) {
    throw new MpzUploadError('VALIDATION', `Ungültige messageId "${messageId}".`)
  }

  const data = await io.readCoachMessages()
  const messageIndex = data.messages.findIndex((m) => m.id === messageId)
  if (messageIndex < 0) {
    throw new MpzCoachMessagesError(
      'NOT_FOUND',
      `Coach-Message "${messageId}" nicht gefunden.`,
    )
  }

  const { headerSlice, byteLength } = await readHeaderSlice(input.source)
  await validateDialogWavUpload({
    headerSlice,
    byteLength,
    originalName: input.originalName,
  })

  const collision = input.collision ?? 'replace'
  const { appRoot } = io.getPaths()
  const destPath = coachAudioFsPath(appRoot, messageId)
  const expectedQuelle = coachApiQuelle(messageId)

  const { bakPath } = await writeWavWithReplace(input.source, destPath, collision)

  data.messages[messageIndex]!.quelle = expectedQuelle

  let writeResult: Awaited<ReturnType<MpzContentIo['writeCoachMessages']>>
  let validation: MpzValidationReport
  try {
    const stationsData = await io.readStations()
    writeResult = await io.writeCoachMessages(data, {
      makeBackup: true,
      postValidate: true,
      stationCount: stationsData.stations.length,
      stationSlugs: new Set(
        stationsData.stations.map((s) => s.slug).filter(Boolean),
      ),
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
    quelle: expectedQuelle,
    destPath,
    messageId,
    mtime: writeResult.mtime,
    validation,
  }
}

export async function ingestCoachClip(
  input: IngestCoachClipInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<IngestCoachClipResult> {
  return withMpzWriteLock(() => ingestCoachClipInner(input, io))
}

export function resetCoachIngestLockForTests(): void {
  resetMpzWriteLockForTests()
}
