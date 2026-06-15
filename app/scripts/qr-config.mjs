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

/**
 * Schulfest-Drucksubset (Vorschlag bis Freigabe Schule, Epic #86 / Playbook).
 * ≤7 Raum-QRs + Entry `fest` — siehe anleitungen/schulfest-gs39-playbook.md
 *
 * physisch offen (~5): turnhalle, speiseraum, werken, lesewelt, klassenzimmer
 * Hof-Virtualisierung (~2): musik, daz
 */
export const SCHULFEST_QR_SLUGS = [
  'turnhalle',
  'speiseraum',
  'werken',
  'lesewelt',
  'klassenzimmer',
  'musik',
  'daz',
]

/** Entry-QRs für Schulfest-Druckpack (nur fest). */
export const SCHULFEST_ENTRY_FILES = ['entry-fest.png']
