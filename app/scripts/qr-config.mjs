/** @typedef {'fest' | 'heft'} EntryMode */

export const EXPECTED_STATION_COUNT = 12

/** Schwellwert für warnIfUrlTooLong (Zeichen) */
export const URL_LENGTH_WARN = 120

/**
 * @type {ReadonlyArray<{ file: string; token: string; mode: EntryMode }>}
 */
export const ENTRY_QRS = [
  { file: 'entry-fest.png', token: 'fest-2026', mode: 'fest' },
  { file: 'entry-heft.png', token: 'heft-2026-27', mode: 'heft' },
]
