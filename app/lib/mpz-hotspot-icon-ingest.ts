import { existsSync } from 'node:fs'
import { mkdir, rename, unlink } from 'node:fs/promises'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  type IngestSource,
  persistFile,
  readHeaderSlice,
} from '@/lib/mpz-medium-ingest'
import {
  MpzUploadError,
  sanitizeUploadFilename,
} from '@/lib/mpz-upload-rules'
import { getHubSlugOrder, isHubSlug } from '@/lib/schoolhouse-hub-map'

export const ICON_EXTENSIONS = ['.svg', '.png', '.webp'] as const
export const MAX_ICON_BYTES = 2 * 1024 * 1024

const ICON_SANITIZE_RULE = {
  extensions: ICON_EXTENSIONS,
  defaultExt: '.svg' as const,
}

const ICON_EXT_SET = new Set<string>(ICON_EXTENSIONS)

const BAHN_A_PRESET_COLLISION_MESSAGE =
  'Dieses Icon ist ein generisches Preset (Bahn A) und kann nur über einen Code-Commit geändert werden.'

export type IconCollisionMode = 'reject' | 'replace'

export interface IngestHotspotIconInput {
  slug: string
  source: IngestSource
  originalName: string
  collision: IconCollisionMode
}

export interface IngestHotspotIconResult {
  path: string
  filename: string
  destPath: string
}

function looksLikeSvg(headerSlice: Buffer): boolean {
  const head = headerSlice
    .subarray(0, Math.min(headerSlice.length, 256))
    .toString('utf8')
    .trimStart()
    .toLowerCase()
  return head.startsWith('<svg') || head.startsWith('<?xml')
}

function mediaIconsRoot(appRoot: string, slug: string): string {
  return normalize(join(appRoot, 'public', 'media', slug, 'icons'))
}

function stationsIconsRoot(appRoot: string, slug: string): string {
  return normalize(join(appRoot, 'public', 'stations-icons', slug))
}

function isPathUnderRoot(candidate: string, root: string): boolean {
  const rootPrefix = `${root}${sep}`
  return candidate === root || candidate.startsWith(rootPrefix)
}

export function resolveIconPublicPath(
  appRoot: string,
  slug: string,
  quelle: string,
): string | null {
  if (!quelle.startsWith('/')) {
    return null
  }

  const mediaPrefix = `/media/${slug}/icons/`
  const stationsPrefix = `/stations-icons/${slug}/`

  let root: string | null = null
  if (quelle.startsWith(mediaPrefix)) {
    root = mediaIconsRoot(appRoot, slug)
  } else if (quelle.startsWith(stationsPrefix)) {
    root = stationsIconsRoot(appRoot, slug)
  } else {
    return null
  }

  const candidate = normalize(join(appRoot, 'public', quelle.slice(1)))
  if (!isPathUnderRoot(candidate, root)) {
    return null
  }

  return candidate
}

function bahnAPresetPath(appRoot: string, slug: string, filename: string): string {
  return join(stationsIconsRoot(appRoot, slug), filename)
}

export async function validateIconUpload(input: {
  headerSlice: Buffer
  byteLength: number
  originalName: string
}): Promise<void> {
  if (input.byteLength <= 0) {
    throw new MpzUploadError('VALIDATION', 'Datei ist leer.')
  }
  if (input.byteLength > MAX_ICON_BYTES) {
    throw new MpzUploadError(
      'VALIDATION',
      `${input.originalName}: Icon ist zu groß (max. 2 MB).`,
    )
  }

  const filename = sanitizeUploadFilename(input.originalName, ICON_SANITIZE_RULE)
  const ext = extname(filename).toLowerCase()

  if (ext === '.svg') {
    if (!looksLikeSvg(input.headerSlice)) {
      throw new MpzUploadError(
        'VALIDATION',
        `${input.originalName}: kein gültiges SVG (erwartet <svg oder <?xml).`,
      )
    }
    return
  }

  const detected = await fileTypeFromBuffer(input.headerSlice)
  if (!detected) {
    throw new MpzUploadError(
      'VALIDATION',
      `${input.originalName}: Dateiformat nicht erkennbar. Erlaubt: .svg, .png, .webp.`,
    )
  }
  const expected = ext === '.png' ? 'png' : 'webp'
  if (detected.ext !== expected) {
    throw new MpzUploadError(
      'VALIDATION',
      `${input.originalName}: Inhalt ist "${detected.ext}" — nicht erlaubt für ${ext}.`,
    )
  }
}

async function safeUnlink(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    /* ignore */
  }
}

async function writeIconWithReplace(
  source: IngestSource,
  destPath: string,
  collision: IconCollisionMode,
): Promise<{ bakPath: string | null }> {
  const bakPath = `${destPath}.bak`
  const tmpPath = `${destPath}.${process.pid}.tmp`
  const hadPrevious = existsSync(destPath)

  if (hadPrevious && collision === 'reject') {
    throw new MpzUploadError(
      'COLLISION',
      `Icon existiert bereits: ${destPath}`,
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
    if (movedToBak && existsSync(bakPath)) {
      await safeUnlink(bakPath)
    }
    return { bakPath: null }
  } catch (err) {
    await safeUnlink(tmpPath)
    if (movedToBak && existsSync(bakPath)) {
      if (existsSync(destPath)) await safeUnlink(destPath)
      await rename(bakPath, destPath)
    }
    throw err
  }
}

async function listIconPathsInDir(
  dir: string,
  publicPrefix: string,
): Promise<string[]> {
  if (!existsSync(dir)) {
    return []
  }

  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => ICON_EXT_SET.has(extname(name).toLowerCase()))
    .map((name) => `${publicPrefix}${name}`)
}

export async function ingestHotspotIcon(
  input: IngestHotspotIconInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<IngestHotspotIconResult> {
  return withMpzWriteLock(async () => {
    if (!isHubSlug(input.slug)) {
      throw new MpzUploadError(
        'VALIDATION',
        `Unbekannter slug "${input.slug}". Erlaubt: ${getHubSlugOrder().join(', ')}.`,
      )
    }

    const { headerSlice, byteLength } = await readHeaderSlice(input.source)
    await validateIconUpload({
      headerSlice,
      byteLength,
      originalName: input.originalName,
    })

    const filename = sanitizeUploadFilename(input.originalName, ICON_SANITIZE_RULE)
    const { appRoot } = io.getPaths()
    const path = `/media/${input.slug}/icons/${filename}`
    const destPath = resolveIconPublicPath(appRoot, input.slug, path)
    if (!destPath) {
      throw new MpzUploadError('VALIDATION', 'Ungültiger Icon-Zielpfad.')
    }

    if (existsSync(bahnAPresetPath(appRoot, input.slug, filename))) {
      throw new MpzUploadError('VALIDATION', BAHN_A_PRESET_COLLISION_MESSAGE)
    }

    await writeIconWithReplace(input.source, destPath, input.collision)

    return { path, filename, destPath }
  })
}

export async function listStationHotspotIcons(
  slug: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ paths: string[] }> {
  if (!isHubSlug(slug)) {
    throw new MpzUploadError(
      'VALIDATION',
      `Unbekannter slug "${slug}". Erlaubt: ${getHubSlugOrder().join(', ')}.`,
    )
  }

  const { appRoot } = io.getPaths()
  const bahnAPaths = await listIconPathsInDir(
    stationsIconsRoot(appRoot, slug),
    `/stations-icons/${slug}/`,
  )
  const bahnBPaths = await listIconPathsInDir(
    mediaIconsRoot(appRoot, slug),
    `/media/${slug}/icons/`,
  )

  return { paths: [...bahnAPaths, ...bahnBPaths].sort() }
}
