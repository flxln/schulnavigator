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
 * Schulfest-Druckset: alle 12 Räume + Entry `fest`.
 * Räume sind auch ohne vollständigen Content nutzbar (Hub-Freischaltung, Platzhalter).
 * Physische Platzierung (Tür vs. Hof) siehe anleitungen/schulfest-gs39-playbook.md.
 *
 * Kleineres Set bei Bedarf: `npm run generate:qr -- --only=slug1,slug2`
 */
export const SCHULFEST_QR_SLUGS = [
  'klassenzimmer',
  'daz',
  'pc-raum',
  'werken',
  'turnhalle',
  'speiseraum',
  'kunst',
  'lesewelt',
  'hort',
  'musik',
  'schulsozialarbeit',
  'schulhof',
]

/** Entry-QRs für Schulfest-Druckpack (nur fest). */
export const SCHULFEST_ENTRY_FILES = ['entry-fest.png']
