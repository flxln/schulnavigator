/**
 * MVP: eine Schule (GS39). Theme-Werte kommen aus gs39-tokens.css (:root).
 * Komponenten nutzen semantische Tailwind-Klassen (bg-accent, text-fg-1), keine direkten --brand-* in TSX.
 * Mehrere Schulen: später anderes Token-Sheet pro Mandant laden (ADR-003).
 */
export const SCHOOL_ID = 'gs39' as const

export type SchoolId = typeof SCHOOL_ID
