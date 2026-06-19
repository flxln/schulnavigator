import {
  createMpzContentIo,
  type EmbedAllowlistWriteResult,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { isValidEmbedSuffix } from '@/lib/mpz-embed-allowlist-validation'
import type { EmbedAllowlistFile } from '@/lib/mpz-embed-allowlist-validation'

export type EmbedAllowlistErrorCode =
  | 'INVALID_SUFFIX'
  | 'DUPLICATE_SUFFIX'
  | 'EMPTY_SUFFIXES'
  | 'INVALID_BODY'

export class MpzEmbedAllowlistError extends Error {
  readonly code: EmbedAllowlistErrorCode

  constructor(code: EmbedAllowlistErrorCode, message: string) {
    super(message)
    this.name = 'MpzEmbedAllowlistError'
    this.code = code
  }
}

export const EMBED_ALLOWLIST_CLIENT_ERROR_CODES = new Set<EmbedAllowlistErrorCode>([
  'INVALID_SUFFIX',
  'DUPLICATE_SUFFIX',
  'EMPTY_SUFFIXES',
])

export function mapEmbedAllowlistError(
  err: MpzEmbedAllowlistError,
): { status: number; body: { error: string; message: string } } {
  const status = EMBED_ALLOWLIST_CLIENT_ERROR_CODES.has(err.code) ? 422 : 500
  return { status, body: { error: err.code, message: err.message } }
}

export function normalizeEmbedAllowlistSuffixes(raw: readonly string[]): string[] {
  if (raw.length === 0) {
    throw new MpzEmbedAllowlistError(
      'EMPTY_SUFFIXES',
      'Die Allowlist muss mindestens ein Domain-Suffix enthalten.',
    )
  }

  const normalized: string[] = []
  const seen = new Set<string>()

  for (const entry of raw) {
    if (typeof entry !== 'string') {
      throw new MpzEmbedAllowlistError(
        'INVALID_SUFFIX',
        'Jeder Eintrag muss ein String sein.',
      )
    }

    const trimmed = entry.trim()
    if (!isValidEmbedSuffix(trimmed)) {
      throw new MpzEmbedAllowlistError(
        'INVALID_SUFFIX',
        `Suffix "${entry}" ist ungültig (Hostname-Suffix mit mindestens einem Punkt, ohne / oder :).`,
      )
    }

    const lower = trimmed.toLowerCase()
    if (seen.has(lower)) {
      throw new MpzEmbedAllowlistError(
        'DUPLICATE_SUFFIX',
        `Doppeltes Suffix "${lower}".`,
      )
    }
    seen.add(lower)
    normalized.push(lower)
  }

  return normalized.sort()
}

export function parsePutBody(body: unknown): string[] | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (!Array.isArray(raw.suffixes)) {
    return null
  }
  if (!raw.suffixes.every((entry) => typeof entry === 'string')) {
    return null
  }
  return raw.suffixes
}

export async function replaceEmbedAllowlist(
  rawSuffixes: string[],
  io: MpzContentIo = createMpzContentIo(),
): Promise<EmbedAllowlistWriteResult> {
  const suffixes = normalizeEmbedAllowlistSuffixes(rawSuffixes)

  return withMpzWriteLock(async () => {
    const stationsFile = await io.readStations()
    const data: EmbedAllowlistFile = { suffixes }

    const writeResult = await io.writeEmbedAllowlist(data, {
      makeBackup: true,
      postValidate: true,
      stationsFile,
    })

    return { suffixes: data.suffixes, mtime: writeResult.mtime }
  })
}
