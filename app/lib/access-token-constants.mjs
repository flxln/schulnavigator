/** @typedef {'fest' | 'heft'} EntryMode */

/** Single Source of Truth für Dev-/QR-Entry-Token-Strings (ADR-021). */
export const FEST_DEV_TOKEN = 'fest-vkc2AuKW0S7QGHDT'
export const HEFT_DEV_TOKEN = 'heft-ImulQPDmydy7VCVj'

export const FEST_DEV_EXPIRES_AT = '2026-07-31'
export const HEFT_DEV_EXPIRES_AT = '2027-07-31'

/**
 * Entry-QR-Spezifikation — Token-Strings müssen in SN_ACCESS_TOKENS (Production) enthalten sein.
 * @type {ReadonlyArray<{ file: string; token: string; mode: EntryMode }>}
 */
export const ENTRY_QR_SPECS = [
  { file: 'entry-fest.png', token: FEST_DEV_TOKEN, mode: 'fest' },
  { file: 'entry-heft.png', token: HEFT_DEV_TOKEN, mode: 'heft' },
]
