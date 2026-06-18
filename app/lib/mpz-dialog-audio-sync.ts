import { existsSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  buildClipName,
  dialogApiQuelle,
  dialogAudioFsPath,
} from '@/lib/dialog-audio'
import type { DialogSegment } from '@/lib/types'

const TMP_SUFFIX = '.renaming.tmp'

export class MpzDialogAudioSyncError extends Error {
  readonly code = 'AUDIO_SYNC_FAILED' as const

  constructor(message: string) {
    super(message)
    this.name = 'MpzDialogAudioSyncError'
  }
}

export function clipFromQuelle(quelle: string): string | null {
  const match = quelle.match(/\/([^/]+\.wav)$/)
  return match?.[1] ?? null
}

export function planDialogAudioRenames(
  segmentsBefore: DialogSegment[],
  segmentsAfter: DialogSegment[],
): Map<string, string> {
  const renameMap = new Map<string, string>()
  const beforeById = new Map(
    segmentsBefore.map((seg, index) => [seg.id, { seg, index }] as const),
  )

  for (let afterIndex = 0; afterIndex < segmentsAfter.length; afterIndex++) {
    const afterSeg = segmentsAfter[afterIndex]!
    const targetClip = buildClipName(afterIndex, afterSeg.rolle)
    const before = beforeById.get(afterSeg.id)
    if (!before) {
      continue
    }
    const sourceClip =
      clipFromQuelle(before.seg.quelle) ??
      buildClipName(before.index, before.seg.rolle)
    if (sourceClip !== targetClip) {
      renameMap.set(sourceClip, targetClip)
    }
  }

  return renameMap
}

export function applyQuellenAfterSync(
  slug: string,
  segmente: DialogSegment[],
): DialogSegment[] {
  return segmente.map((seg, index) => ({
    ...seg,
    quelle: dialogApiQuelle(slug, buildClipName(index, seg.rolle)),
  }))
}

function preflightRenames(
  slug: string,
  appRoot: string,
  renameMap: Map<string, string>,
): void {
  const sources = new Set(renameMap.keys())
  for (const [source, target] of renameMap) {
    if (source === target) {
      continue
    }
    const targetPath = dialogAudioFsPath(appRoot, slug, target)
    if (existsSync(targetPath) && !sources.has(target)) {
      throw new MpzDialogAudioSyncError(
        `Zieldatei "${target}" existiert bereits und würde überschrieben (Quelle "${source}"). ` +
          'Bitte im Dialog-Audio-Tab bereinigen.',
      )
    }
  }
}

async function unlinkIfExists(path: string): Promise<void> {
  if (existsSync(path)) {
    await unlink(path)
  }
}

export async function syncDialogAudioFiles(
  slug: string,
  segmentsBefore: DialogSegment[],
  segmentsAfter: DialogSegment[],
  appRoot: string,
): Promise<void> {
  const renameMap = planDialogAudioRenames(segmentsBefore, segmentsAfter)
  preflightRenames(slug, appRoot, renameMap)

  const audioDir = dirname(dialogAudioFsPath(appRoot, slug, '01-frieda.wav'))
  await mkdir(audioDir, { recursive: true })

  const phase1: { tmpPath: string; finalPath: string; sourcePath: string }[] = []

  try {
    for (const [source, target] of renameMap) {
      if (source === target) {
        continue
      }
      const sourcePath = dialogAudioFsPath(appRoot, slug, source)
      if (!existsSync(sourcePath)) {
        continue
      }
      const tmpPath = `${sourcePath}${TMP_SUFFIX}`
      const finalPath = dialogAudioFsPath(appRoot, slug, target)
      await unlinkIfExists(tmpPath)
      await rename(sourcePath, tmpPath)
      phase1.push({ tmpPath, finalPath, sourcePath })
    }

    const afterIds = new Set(segmentsAfter.map((seg) => seg.id))
    for (let index = 0; index < segmentsBefore.length; index++) {
      const seg = segmentsBefore[index]!
      if (afterIds.has(seg.id)) {
        continue
      }
      const clip =
        clipFromQuelle(seg.quelle) ?? buildClipName(index, seg.rolle)
      if (renameMap.has(clip)) {
        continue
      }
      await unlinkIfExists(dialogAudioFsPath(appRoot, slug, clip))
    }

    for (const step of phase1) {
      await unlinkIfExists(step.finalPath)
      await rename(step.tmpPath, step.finalPath)
    }
  } catch (err) {
    for (const step of phase1) {
      if (existsSync(step.tmpPath) && !existsSync(step.sourcePath)) {
        await rename(step.tmpPath, step.sourcePath).catch(() => undefined)
      }
    }
    if (err instanceof MpzDialogAudioSyncError) {
      throw err
    }
    throw new MpzDialogAudioSyncError(
      err instanceof Error ? err.message : 'WAV-Sync fehlgeschlagen.',
    )
  }
}
