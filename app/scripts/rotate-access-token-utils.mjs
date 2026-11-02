import { randomBytes } from 'node:crypto'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * @param {'fest' | 'heft'} mode
 * @param {(size: number) => Buffer} randomFn
 * @param {number} entropyBytes
 */
export function generateEntryToken(mode, randomFn = randomBytes, entropyBytes = 12) {
  if (entropyBytes < 8 || entropyBytes > 32) {
    throw new Error('--entropy-bytes muss zwischen 8 und 32 liegen')
  }
  const suffix = randomFn(entropyBytes).toString('base64url')
  return `${mode}-${suffix}`
}

/**
 * @param {string} expiresAt
 */
export function assertIsoDate(expiresAt, label) {
  if (!ISO_DATE_RE.test(expiresAt)) {
    throw new Error(`${label} muss ISO-Datum YYYY-MM-DD sein`)
  }
}

/**
 * @param {{ fest: string; heft: string; festExpires: string; heftExpires: string }} params
 */
export function renderAccessTokenConstants({ fest, heft, festExpires, heftExpires }) {
  assertIsoDate(festExpires, 'festExpires')
  assertIsoDate(heftExpires, 'heftExpires')
  if (!fest.startsWith('fest-') || fest.length < 10) {
    throw new Error('fest-Token muss mit fest- beginnen')
  }
  if (!heft.startsWith('heft-') || heft.length < 10) {
    throw new Error('heft-Token muss mit heft- beginnen')
  }

  return `/** @typedef {'fest' | 'heft'} EntryMode */

/** Single Source of Truth für Dev-/QR-Entry-Token-Strings (ADR-021). */
export const FEST_DEV_TOKEN = '${fest}'
export const HEFT_DEV_TOKEN = '${heft}'

/**
 * Post-Fest: gedruckter entry-fest-QR → Heft-Hub (gleicher Token-String, kein Neudruck).
 */
export const FEST_ENTRY_HUB_MODE = 'heft'

export const FEST_DEV_EXPIRES_AT = '${festExpires}'
export const HEFT_DEV_EXPIRES_AT = '${heftExpires}'

/**
 * Entry-QR-Spezifikation — Token-Strings müssen in SN_ACCESS_TOKENS (Production) enthalten sein.
 * @type {ReadonlyArray<{ file: string; token: string; mode: EntryMode }>}
 */
export const ENTRY_QR_SPECS = [
  { file: 'entry-fest.png', token: FEST_DEV_TOKEN, mode: FEST_ENTRY_HUB_MODE },
  { file: 'entry-heft.png', token: HEFT_DEV_TOKEN, mode: 'heft' },
]
`
}

/**
 * @param {{ fest: string; heft: string; festExpires: string; heftExpires: string }} params
 */
export function buildAccessTokensPayload({ fest, heft, festExpires, heftExpires }) {
  return [
    { token: fest, mode: 'heft', expiresAt: festExpires },
    { token: heft, mode: 'heft', expiresAt: heftExpires },
  ]
}

/**
 * Specs für assertEntryQrSync nach Rotation (entry-fest → Heft-Hub).
 * @param {string} fest
 * @param {string} heft
 */
export function buildEntryQrSpecs(fest, heft) {
  return [
    { file: 'entry-fest.png', token: fest, mode: 'heft' },
    { file: 'entry-heft.png', token: heft, mode: 'heft' },
  ]
}

/**
 * @param {string[]} argv
 */
export function parseRotateArgs(argv) {
  /** @type {{
   *   dryRun: boolean;
   *   festOnly: boolean;
   *   heftOnly: boolean;
   *   noQr: boolean;
   *   noTest: boolean;
   *   festExpires?: string;
   *   heftExpires?: string;
   *   entropyBytes: number;
   * }} */
  const opts = {
    dryRun: false,
    festOnly: false,
    heftOnly: false,
    noQr: false,
    noTest: false,
    entropyBytes: 12,
  }

  for (const arg of argv) {
    if (arg === '--dry-run') {
      opts.dryRun = true
    } else if (arg === '--fest-only') {
      opts.festOnly = true
    } else if (arg === '--heft-only') {
      opts.heftOnly = true
    } else if (arg === '--no-qr') {
      opts.noQr = true
    } else if (arg === '--no-test') {
      opts.noTest = true
    } else if (arg.startsWith('--fest-expires=')) {
      opts.festExpires = arg.slice('--fest-expires='.length)
    } else if (arg.startsWith('--heft-expires=')) {
      opts.heftExpires = arg.slice('--heft-expires='.length)
    } else if (arg.startsWith('--entropy-bytes=')) {
      const n = Number(arg.slice('--entropy-bytes='.length))
      if (!Number.isFinite(n)) {
        throw new Error('--entropy-bytes muss eine Zahl sein')
      }
      opts.entropyBytes = Math.floor(n)
    } else if (arg.startsWith('-')) {
      throw new Error(`Unbekanntes Flag: ${arg}`)
    }
  }

  if (opts.festOnly && opts.heftOnly) {
    throw new Error('--fest-only und --heft-only schließen sich aus')
  }

  return opts
}

/**
 * @param {ReturnType<typeof parseRotateArgs>} opts
 * @param {{ FEST_DEV_TOKEN: string; HEFT_DEV_TOKEN: string; FEST_DEV_EXPIRES_AT: string; HEFT_DEV_EXPIRES_AT: string }} current
 * @param {(mode: 'fest' | 'heft') => string} tokenFactory
 */
export function resolveRotationTargets(opts, current, tokenFactory) {
  const festExpires = opts.festExpires ?? current.FEST_DEV_EXPIRES_AT
  const heftExpires = opts.heftExpires ?? current.HEFT_DEV_EXPIRES_AT

  let fest = current.FEST_DEV_TOKEN
  let heft = current.HEFT_DEV_TOKEN

  if (!opts.heftOnly) {
    fest = tokenFactory('fest')
  }
  if (!opts.festOnly) {
    heft = tokenFactory('heft')
  }

  return { fest, heft, festExpires, heftExpires }
}
