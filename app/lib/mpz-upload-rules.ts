import { fileTypeFromBuffer } from 'file-type'
import { basename, extname } from 'node:path'
import type { MediumTyp } from '@/lib/types'

/**
 * Zentrale Upload-Regeln für MPZ Studio (#147, ADR-022).
 *
 * Bewusste Abweichungen vom Plantext (Pre-Mortem-Befunde, verbindlich):
 * - Befund #3: Magic-Bytes via `file-type` statt starrem Buffer-Slice. MP4/M4A/WAV-
 *   Container sind zu variantenreich (ftyp steht nicht immer exakt an Offset 4) für
 *   ein robustes manuelles Slice. `file-type` ist ESM-only, läuft aber unter tsx
 *   (CLI), Vitest und dem Next-Bundler problemlos (verifiziert im Spike).
 * - Befund #2: Validierung arbeitet auf einem Header-Slice (`headerSlice`) plus
 *   einer Größenangabe (`byteLength`) — nie auf der vollen Datei. So bleibt die
 *   Domain-Funktion OOM-resistent und ein späterer Streaming-Umbau erzwingt kein
 *   tiefes Refactoring.
 */

export type UploadTyp = Extract<MediumTyp, 'audio' | 'video' | 'foto' | 'text'>

export type MpzUploadErrorCode = 'VALIDATION' | 'COLLISION' | 'IO'

export class MpzUploadError extends Error {
  readonly code: MpzUploadErrorCode

  constructor(code: MpzUploadErrorCode, message: string) {
    super(message)
    this.name = 'MpzUploadError'
    this.code = code
  }
}

const KB = 1024
const MB = 1024 * 1024

interface TypRule {
  folder: string
  /** Erlaubte Endungen (lowercase, mit Punkt). */
  extensions: string[]
  /** Default-Endung, wenn der Upload-Name keine erlaubte trägt. */
  defaultExt: string
  maxBytes: number
  /** Von `file-type` gemeldete Container-Endungen, die wir akzeptieren. */
  detectExt: string[]
  /** true → binär (file-type-Sniffing); false → Textprüfung. */
  binary: boolean
}

export const UPLOAD_RULES: Record<UploadTyp, TypRule> = {
  audio: {
    folder: 'audio',
    extensions: ['.mp3', '.wav', '.m4a'],
    defaultExt: '.mp3',
    maxBytes: 25 * MB,
    detectExt: ['mp3', 'wav', 'm4a'],
    binary: true,
  },
  video: {
    folder: 'video',
    extensions: ['.mp4'],
    defaultExt: '.mp4',
    maxBytes: 150 * MB,
    detectExt: ['mp4'],
    binary: true,
  },
  foto: {
    folder: 'fotos',
    extensions: ['.jpg', '.jpeg', '.webp'],
    defaultExt: '.jpg',
    maxBytes: 8 * MB,
    detectExt: ['jpg', 'webp'],
    binary: true,
  },
  text: {
    folder: 'texte',
    extensions: ['.md', '.txt'],
    defaultExt: '.md',
    maxBytes: 512 * KB,
    detectExt: [],
    binary: false,
  },
}

export const UPLOAD_TYPES = Object.keys(UPLOAD_RULES) as UploadTyp[]

export function isUploadTyp(value: string): value is UploadTyp {
  return value in UPLOAD_RULES
}

export function getUploadFolder(typ: UploadTyp): string {
  return UPLOAD_RULES[typ].folder
}

export function slugifyId(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function sanitizeUploadFilename(
  originalName: string,
  rule: { extensions: readonly string[]; defaultExt: string },
): string {
  const base = basename(originalName)
  const rawExt = extname(base).toLowerCase()
  const stem = slugifyId(base.slice(0, base.length - rawExt.length)) || 'datei'
  const ext = rule.extensions.includes(rawExt) ? rawExt : rule.defaultExt
  return `${stem}${ext}`
}

/**
 * AirDrop-Namen (`IMG_1234.heic`, Leerzeichen, Umlaute) werden nie 1:1 übernommen.
 * Erzwingt eine erlaubte Endung je Typ (HEIC etc. → Default-Ext, aber der Inhalt
 * wird separat über Magic-Bytes abgelehnt).
 */
export function sanitizeFilename(originalName: string, typ: UploadTyp): string {
  const rule = UPLOAD_RULES[typ]
  return sanitizeUploadFilename(originalName, {
    extensions: rule.extensions,
    defaultExt: rule.defaultExt,
  })
}

function formatBytes(bytes: number): string {
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
}

function looksLikeUtf8Text(slice: Buffer): boolean {
  // NUL-Byte-Stapel deutet auf Binärformat hin (z. B. HEIC, PDF).
  let nulCount = 0
  for (const byte of slice) {
    if (byte === 0x00) {
      nulCount += 1
      if (nulCount >= 2) return false
    } else {
      nulCount = 0
    }
  }
  return true
}

export interface ValidateUploadInput {
  typ: UploadTyp
  /** Kopf der Datei (>= 4096 B reichen für Container-Sniffing). */
  headerSlice: Buffer
  /** Gesamtgröße in Bytes (aus Dateigröße oder Buffer-Länge). */
  byteLength: number
  originalName: string
}

/**
 * Prüft Größe und Magic-Bytes anhand eines Header-Slices — ohne die volle Datei
 * im RAM zu halten (Befund #2). Wirft `MpzUploadError('VALIDATION')` bei Verstoß.
 */
export async function validateUpload({
  typ,
  headerSlice,
  byteLength,
  originalName,
}: ValidateUploadInput): Promise<void> {
  const rule = UPLOAD_RULES[typ]

  if (byteLength <= 0) {
    throw new MpzUploadError('VALIDATION', 'Datei ist leer.')
  }
  if (byteLength > rule.maxBytes) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Datei ist zu groß (${formatBytes(byteLength)}; max. ${formatBytes(rule.maxBytes)}).`,
    )
  }

  if (!rule.binary) {
    if (!looksLikeUtf8Text(headerSlice)) {
      throw new MpzUploadError(
        'VALIDATION',
        `${originalName}: kein lesbarer UTF-8-Text (Binärdaten erkannt). Erlaubt: ${rule.extensions.join(', ')}.`,
      )
    }
    return
  }

  const detected = await fileTypeFromBuffer(headerSlice)
  if (!detected) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Dateiformat nicht erkennbar. Erlaubt: ${rule.extensions.join(', ')}.`,
    )
  }
  if (!rule.detectExt.includes(detected.ext)) {
    throw new MpzUploadError(
      'VALIDATION',
      `${originalName}: Inhalt ist "${detected.ext}" (${detected.mime}) — nicht erlaubt für Typ "${typ}". ` +
        (detected.ext === 'heic' || detected.ext === 'heif'
          ? 'HEIC wird nicht unterstützt — bitte als JPG exportieren.'
          : `Erlaubt: ${rule.extensions.join(', ')}.`),
    )
  }
}

/** Mindestgröße für den Header-Slice, die zum Sniffing aller Container reicht. */
export const HEADER_SLICE_BYTES = 4096
