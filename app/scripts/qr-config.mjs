/** @typedef {'fest' | 'heft'} EntryMode */

export {
  ENTRY_QR_SPECS as ENTRY_QRS,
  FEST_DEV_TOKEN,
  HEFT_DEV_TOKEN,
} from '../lib/access-token-constants.mjs'

export const EXPECTED_STATION_COUNT = 12

/** Schwellwert für warnIfUrlTooLong (Zeichen) */
export const URL_LENGTH_WARN = 120

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
