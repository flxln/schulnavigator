import type { StationsFile } from '@/lib/types'
import { validateStationsFile } from '@/lib/validate-stations'
import { validateStationAssets } from '@/scripts/validate-station-assets'

export type SlugValidationBucket = {
  errors: string[]
  warnings: string[]
}

export type StationsContentValidation = {
  structureErrors: string[]
  assetErrors: string[]
  warnings: string[]
  bySlug: Record<string, SlugValidationBucket>
}

export const STATION_MSG_RE = /^Station ([^\s(]+)/

function emptyBucket(): SlugValidationBucket {
  return { errors: [], warnings: [] }
}

function bucketForSlug(
  bySlug: Record<string, SlugValidationBucket>,
  slug: string,
): SlugValidationBucket {
  if (!bySlug[slug]) {
    bySlug[slug] = emptyBucket()
  }
  return bySlug[slug]
}

export function groupMessagesBySlug(
  errors: string[],
  warnings: string[],
): Record<string, SlugValidationBucket> {
  const bySlug: Record<string, SlugValidationBucket> = {}

  for (const msg of errors) {
    const match = STATION_MSG_RE.exec(msg)
    const slug = match?.[1]
    if (slug) {
      bucketForSlug(bySlug, slug).errors.push(msg)
    }
  }
  for (const msg of warnings) {
    const match = STATION_MSG_RE.exec(msg)
    const slug = match?.[1]
    if (slug) {
      bucketForSlug(bySlug, slug).warnings.push(msg)
    }
  }

  return bySlug
}

export function mergeValidationErrors(
  validation: StationsContentValidation,
): string[] {
  return [...validation.structureErrors, ...validation.assetErrors]
}

export function validateStationsContent(
  data: StationsFile,
  appRoot: string,
): StationsContentValidation {
  const structureErrors: string[] = []
  const warnings: string[] = []

  try {
    validateStationsFile(data)
  } catch (err) {
    structureErrors.push(
      err instanceof Error ? err.message : 'Struktur-Validierung fehlgeschlagen',
    )
  }

  const assetResult = validateStationAssets(data, { appRoot })

  return {
    structureErrors,
    assetErrors: assetResult.errors,
    warnings: assetResult.warnings,
    bySlug: groupMessagesBySlug(assetResult.errors, assetResult.warnings),
  }
}

/** Strukturfehler und Asset-Meldungen ohne Station-Präfix. */
export function globalValidationErrors(errors: string[]): string[] {
  return errors.filter((msg) => !STATION_MSG_RE.test(msg))
}

/** Kein rename bei Scope-Fehlern; Warnings nie. */
export function shouldRollbackPostValidate(
  validation: StationsContentValidation,
  touchedSlugs?: string[],
): boolean {
  if (validation.structureErrors.length > 0) {
    return true
  }

  if (!touchedSlugs || touchedSlugs.length === 0) {
    return validation.assetErrors.length > 0
  }

  return touchedSlugs.some(
    (slug) => (validation.bySlug[slug]?.errors.length ?? 0) > 0,
  )
}
