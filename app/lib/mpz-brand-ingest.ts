import { existsSync } from 'node:fs'
import { mkdir, rename, stat, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  brandFilenameForSlot,
  BRAND_SLOT_ORDER,
  getBrandSlot,
  isBrandSlotId,
  resolveBrandDestPath,
  validateBrandUpload,
  type BrandSlotId,
  type BrandSlotManifest,
} from '@/lib/mpz-brand-validation'
import {
  type IngestSource,
  persistFile,
  readHeaderSlice,
} from '@/lib/mpz-medium-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export type { BrandSlotManifest } from '@/lib/mpz-brand-validation'

export interface IngestBrandAssetInput {
  slotId: string
  source: IngestSource
  originalName: string
}

export interface IngestBrandAssetResult {
  path: string
  filename: string
  mtime: string
  destPath: string
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

async function writeBrandWithReplace(
  source: IngestSource,
  destPath: string,
): Promise<void> {
  const bakPath = `${destPath}.bak`
  const tmpPath = `${destPath}.${process.pid}.tmp`
  const hadPrevious = existsSync(destPath)

  let movedToBak = false
  if (hadPrevious) {
    if (existsSync(bakPath)) await safeUnlink(bakPath)
    await rename(destPath, bakPath)
    movedToBak = true
  }

  try {
    await mkdir(dirname(destPath), { recursive: true })
    await persistFile(source, tmpPath)
    await rename(tmpPath, destPath)
    if (movedToBak && existsSync(bakPath)) {
      await safeUnlink(bakPath)
    }
  } catch (err) {
    await safeUnlink(tmpPath)
    if (movedToBak && existsSync(bakPath)) {
      if (existsSync(destPath)) await safeUnlink(destPath)
      await rename(bakPath, destPath)
    }
    if (err instanceof MpzUploadError) {
      throw err
    }
    throw new MpzUploadError(
      'IO',
      err instanceof Error ? err.message : 'Datei konnte nicht geschrieben werden.',
    )
  }
}

async function statSlotFile(destPath: string): Promise<{
  exists: boolean
  byteLength: number | null
  mtime: string | null
}> {
  try {
    const info = await stat(destPath)
    return {
      exists: true,
      byteLength: info.size,
      mtime: info.mtime.toISOString(),
    }
  } catch {
    return { exists: false, byteLength: null, mtime: null }
  }
}

export async function listBrandManifest(
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ slots: BrandSlotManifest[] }> {
  const { appRoot } = io.getPaths()
  const slots: BrandSlotManifest[] = []

  for (const slotId of BRAND_SLOT_ORDER) {
    const slot = getBrandSlot(slotId)!
    const destPath = resolveBrandDestPath(appRoot, slotId)
    const fileStat =
      destPath !== null ? await statSlotFile(destPath) : { exists: false, byteLength: null, mtime: null }

    slots.push({
      id: slotId,
      label: slot.label,
      publicPath: slot.publicPath,
      exists: fileStat.exists,
      byteLength: fileStat.byteLength,
      mtime: fileStat.mtime,
      accept: slot.accept,
      maxBytes: slot.maxBytes,
      category: slot.category,
    })
  }

  return { slots }
}

export async function ingestBrandAsset(
  input: IngestBrandAssetInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<IngestBrandAssetResult> {
  return withMpzWriteLock(async () => {
    if (!isBrandSlotId(input.slotId)) {
      throw new MpzUploadError(
        'VALIDATION',
        `Unbekannter Slot "${input.slotId}".`,
      )
    }

    const slotId = input.slotId
    const slot = getBrandSlot(slotId)!
    const { appRoot } = io.getPaths()
    const destPath = resolveBrandDestPath(appRoot, slotId)
    if (!destPath) {
      throw new MpzUploadError('VALIDATION', 'Ungültiger Brand-Zielpfad.')
    }

    const { headerSlice, byteLength } = await readHeaderSlice(input.source)
    await validateBrandUpload({
      slot,
      headerSlice,
      byteLength,
      originalName: input.originalName,
    })

    await writeBrandWithReplace(input.source, destPath)

    const fileStat = await stat(destPath)
    const filename = brandFilenameForSlot(slotId)

    return {
      path: slot.publicPath,
      filename,
      mtime: fileStat.mtime.toISOString(),
      destPath,
    }
  })
}
