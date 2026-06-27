/** @typedef {'fest' | 'heft'} EntryMode */

/** Single Source of Truth für Dev-/QR-Entry-Token-Strings (ADR-021). */
export const FEST_DEV_TOKEN = 'fest-vkc2AuKW0S7QGHDT'
export const HEFT_DEV_TOKEN = 'heft-ImulQPDmydy7VCVj'

/**
 * Post-Fest (GS39 ab 27.06.2026): gedruckter `entry-fest`-QR liefert Heft-Hub —
 * gleicher Token-String in URL, kein Neudruck der Raum-QRs.
 */
export const FEST_ENTRY_HUB_MODE = 'heft'

export const FEST_DEV_EXPIRES_AT = '2027-07-31'
export const HEFT_DEV_EXPIRES_AT = '2027-07-31'

/**
 * Entry-QR-Spezifikation — Token-Strings müssen in SN_ACCESS_TOKENS (Production) enthalten sein.
 * @type {ReadonlyArray<{ file: string; token: string; mode: EntryMode }>}
 */
export const ENTRY_QR_SPECS = [
  { file: 'entry-fest.png', token: FEST_DEV_TOKEN, mode: FEST_ENTRY_HUB_MODE },
  { file: 'entry-heft.png', token: HEFT_DEV_TOKEN, mode: 'heft' },
]
