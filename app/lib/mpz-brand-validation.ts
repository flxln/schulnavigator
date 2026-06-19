import { fileTypeFromBuffer } from 'file-type'
import { basename, join, normalize, sep } from 'node:path'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

const KB = 1024
const MB = 1024 * KB

export type BrandAccept = 'svg' | 'png'

export type BrandSlotId =
  | 'logo-jubilaeum-lockup'
  | 'logo-badge'
  | 'logo-mpz'
  | 'mascot-frieda'
  | 'mascot-otto'
  | 'motif-bunting'
  | 'motif-balloons'
  | 'motif-heart-sparkles'

export type BrandSlotCategory = 'logos' | 'mascots' | 'motifs'

export interface BrandSlotDefinition {
  id: BrandSlotId
  label: string
  category: BrandSlotCategory
  publicPath: string
  accept: BrandAccept
  maxBytes: number
}

export const BRAND_SLOTS: Record<BrandSlotId, BrandSlotDefinition> = {
  'logo-jubilaeum-lockup': {
    id: 'logo-jubilaeum-lockup',
    label: 'Jubiläums-Lockup',
    category: 'logos',
    publicPath: '/brand/logos/jubilaeum-lockup.svg',
    accept: 'svg',
    maxBytes: 512 * KB,
  },
  'logo-badge': {
    id: 'logo-badge',
    label: 'Badge',
    category: 'logos',
    publicPath: '/brand/logos/badge.svg',
    accept: 'svg',
    maxBytes: 512 * KB,
  },
  'logo-mpz': {
    id: 'logo-mpz',
    label: 'MPZ-Logo',
    category: 'logos',
    publicPath: '/brand/logos/mpz-logo.png',
    accept: 'png',
    maxBytes: 2 * MB,
  },
  'mascot-frieda': {
    id: 'mascot-frieda',
    label: 'Frieda',
    category: 'mascots',
    publicPath: '/brand/mascots/frieda.png',
    accept: 'png',
    maxBytes: 4 * MB,
  },
  'mascot-otto': {
    id: 'mascot-otto',
    label: 'Otto',
    category: 'mascots',
    publicPath: '/brand/mascots/otto.png',
    accept: 'png',
    maxBytes: 4 * MB,
  },
  'motif-bunting': {
    id: 'motif-bunting',
    label: 'Wimpelkette',
    category: 'motifs',
    publicPath: '/brand/motifs/bunting.png',
    accept: 'png',
    maxBytes: 4 * MB,
  },
  'motif-balloons': {
    id: 'motif-balloons',
    label: 'Ballons',
    category: 'motifs',
    publicPath: '/brand/motifs/balloons.png',
    accept: 'png',
    maxBytes: 4 * MB,
  },
  'motif-heart-sparkles': {
    id: 'motif-heart-sparkles',
    label: 'Herz-Funkeln',
    category: 'motifs',
    publicPath: '/brand/motifs/heart-sparkles.png',
    accept: 'png',
    maxBytes: 4 * MB,
  },
}

export const BRAND_SLOT_ORDER = Object.keys(BRAND_SLOTS) as BrandSlotId[]

export type BrandSlotManifest = {
  id: BrandSlotId
  label: string
  publicPath: string
  exists: boolean
  byteLength: number | null
  mtime: string | null
  accept: BrandAccept
  maxBytes: number
  category: BrandSlotCategory
}

export function isBrandSlotId(value: string): value is BrandSlotId {
  return value in BRAND_SLOTS
}

export function getBrandSlot(slotId: string): BrandSlotDefinition | null {
  if (!isBrandSlotId(slotId)) {
    return null
  }
  return BRAND_SLOTS[slotId]
}

function looksLikeSvg(headerSlice: Buffer): boolean {
  const head = headerSlice
    .subarray(0, Math.min(headerSlice.length, 256))
    .toString('utf8')
    .trimStart()
    .toLowerCase()
  return head.startsWith('<svg') || head.startsWith('<?xml')
}

function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}

export function resolveBrandDestPath(appRoot: string, slotId: BrandSlotId): string | null {
  const slot = BRAND_SLOTS[slotId]
  const relativePublic = slot.publicPath.replace(/^\//, '')
  const candidate = normalize(join(appRoot, 'public', relativePublic))
  const brandRoot = normalize(join(appRoot, 'public', 'brand'))
  const brandPrefix = `${brandRoot}${sep}`
  if (candidate !== brandRoot && !candidate.startsWith(brandPrefix)) {
    return null
  }
  return candidate
}

export async function validateBrandUpload(input: {
  slot: BrandSlotDefinition
  headerSlice: Buffer
  byteLength: number
  originalName: string
}): Promise<void> {
  const { slot, headerSlice, byteLength, originalName } = input

  if (byteLength <= 0) {
    throw new MpzUploadError('VALIDATION', 'Datei ist leer.')
  }
  if (byteLength > slot.maxBytes) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Datei ist zu groß (${formatBytes(byteLength)}; max. ${formatBytes(slot.maxBytes)}).`,
    )
  }

  if (slot.accept === 'svg') {
    if (!looksLikeSvg(headerSlice)) {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: kein gültiges SVG (erwartet <svg oder <?xml).`,
      )
    }
    return
  }

  const detected = await fileTypeFromBuffer(headerSlice)
  if (!detected) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Dateiformat nicht erkennbar. Erlaubt: PNG.`,
    )
  }
  if (detected.ext !== 'png') {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Inhalt ist "${detected.ext}" — nicht erlaubt für diesen Slot (erwartet PNG).`,
    )
  }
}

export function brandFilenameForSlot(slotId: BrandSlotId): string {
  return basename(BRAND_SLOTS[slotId].publicPath)
}
