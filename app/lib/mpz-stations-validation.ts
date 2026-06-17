import type { StationsFile } from '@/lib/types'
import { validateStationsFile } from '@/lib/validate-stations'
import { validateStationAssets } from '@/scripts/validate-station-assets'

export type SlugValidationBucket = {
  errors: string[]
  warnings: string[]
}

export type StationsContentValidation = {
  errors: string[]
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

export function validateStationsContent(
  data: StationsFile,
  appRoot: string,
): StationsContentValidation {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    validateStationsFile(data)
  } catch (err) {
    errors.push(
      err instanceof Error ? err.message : 'Struktur-Validierung fehlgeschlagen',
    )
  }

  const assetResult = validateStationAssets(data, { appRoot })
  errors.push(...assetResult.errors)
  warnings.push(...assetResult.warnings)

  return {
    errors,
    warnings,
    bySlug: groupMessagesBySlug(errors, warnings),
  }
}

export function globalValidationErrors(errors: string[]): string[] {
  return errors.filter((msg) => !STATION_MSG_RE.test(msg))
}

/** Post-Validate-Rollback: nur Asset-errors im Scope; Warnings nie. */
export function shouldRollbackPostValidate(
  validation: StationsContentValidation,
  touchedSlug?: string,
): boolean {
  if (globalValidationErrors(validation.errors).length > 0) {
    return true
  }

  if (!touchedSlug) {
    return Object.values(validation.bySlug).some((b) => b.errors.length > 0)
  }

  return (validation.bySlug[touchedSlug]?.errors.length ?? 0) > 0
}
