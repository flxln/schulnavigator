import { stat } from 'node:fs/promises'
import { auditDialogAudio } from '@/lib/mpz-dialog-audio-ingest'
import {
  createMpzContentIo,
  type MpzContentIo,
} from '@/lib/mpz-content-io'
import { getHubSlugMap, MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'
import {
  globalValidationErrors,
  mergeValidationErrors,
  type SlugValidationBucket,
  validateStationsContent,
} from '@/lib/mpz-stations-validation'
import type { Station, StationsFile, ViewerMode } from '@/lib/types'

export { MPZ_HUB_SLUGS }
export { groupMessagesBySlug } from '@/lib/mpz-stations-validation'
export type { SlugValidationBucket } from '@/lib/mpz-stations-validation'

export type StationHealth = 'ok' | 'warn' | 'error'

export type MpzStationOverview = {
  slug: string
  hubNr: number
  titel: string
  viewer: ViewerMode
  medienCount: number
  hotspotCount: number
  hasDialog: boolean
  hasBild: boolean
  hasPanorama360: boolean
  health: StationHealth
  issues: string[]
}

export type MpzValidationReport = {
  ok: boolean
  checkedAt: string
  durationMs: number
  errors: string[]
  warnings: string[]
  bySlug: Record<string, SlugValidationBucket>
  stationSummaries: MpzStationOverview[]
  stationsModifiedAt: string | null
}

function emptyBucket(): SlugValidationBucket {
  return { errors: [], warnings: [] }
}

function resolveViewer(station: Station): ViewerMode {
  return station.viewer ?? 'flat'
}

function dialogIssues(
  audit: ReturnType<typeof auditDialogAudio> | null,
): { errors: string[]; warnings: string[] } {
  if (!audit) return { errors: [], warnings: [] }
  const errors: string[] = []
  const warnings: string[] = []
  for (const seg of audit.segments) {
    if (seg.state === 'fehlt' || seg.state === 'drift') {
      errors.push(`Dialog ${seg.expectedClip}: ${seg.state}`)
    } else if (seg.state === 'leer') {
      warnings.push(`Dialog ${seg.expectedClip}: WAV fehlt`)
    }
  }
  if (audit.orphans.length > 0) {
    warnings.push(`Dialog: ${audit.orphans.length} verwaiste WAV(s)`)
  }
  return { errors, warnings }
}

function heuristicIssues(station: Station | undefined): string[] {
  if (!station) return []
  const hints: string[] = []
  if (!station.medien?.length) hints.push('Keine Medien')
  const hs = (station.hotspots?.length ?? 0) + (station.hotspots360?.length ?? 0)
  if (hs === 0) hints.push('Keine Hotspots')
  if (!station.beschreibung?.trim()) hints.push('Beschreibung leer')
  if (!station.bild?.trim()) hints.push('Kein Raumbild (bild)')
  return hints
}

function mergeHealth(
  slugIssues: SlugValidationBucket,
  dialog: { errors: string[]; warnings: string[] },
  heuristics: string[],
  stationMissing: boolean,
): { health: StationHealth; issues: string[] } {
  const issues = [
    ...slugIssues.errors,
    ...dialog.errors,
    ...slugIssues.warnings,
    ...dialog.warnings,
    ...heuristics,
  ].slice(0, 3)

  if (stationMissing || slugIssues.errors.length > 0 || dialog.errors.length > 0) {
    return { health: 'error', issues }
  }
  if (
    slugIssues.warnings.length > 0 ||
    dialog.warnings.length > 0 ||
    heuristics.length > 0
  ) {
    return { health: 'warn', issues }
  }
  return { health: 'ok', issues: [] }
}

export function buildStationOverviews(
  stationsFile: StationsFile,
  bySlug: Record<string, SlugValidationBucket>,
  appRoot: string,
): MpzStationOverview[] {
  const bySlugMap = new Map(stationsFile.stations.map((s) => [s.slug, s]))

  return MPZ_HUB_SLUGS.map((slug) => {
    const hub = getHubSlugMap()[slug]
    const station = bySlugMap.get(slug)
    const slugIssues = bySlug[slug] ?? emptyBucket()
    const audit =
      station?.dialog?.segmente?.length
        ? auditDialogAudio(station, appRoot)
        : null
    const dialog = dialogIssues(audit)
    const heuristics = station
      ? heuristicIssues(station)
      : ['Station fehlt in stations.json']
    const { health, issues } = mergeHealth(
      slugIssues,
      dialog,
      heuristics,
      !station,
    )

    return {
      slug,
      hubNr: hub!.nr,
      titel: station?.titel ?? slug,
      viewer: station ? resolveViewer(station) : 'flat',
      medienCount: station?.medien?.length ?? 0,
      hotspotCount:
        (station?.hotspots?.length ?? 0) +
        (station?.hotspots360?.length ?? 0),
      hasDialog: !!station?.dialog?.segmente?.length,
      hasBild: !!station?.bild?.trim(),
      hasPanorama360: !!station?.panorama360?.trim(),
      health,
      issues,
    }
  })
}

export async function getStationsJsonModifiedAt(
  io: MpzContentIo = createMpzContentIo(),
): Promise<string | null> {
  try {
    const { stationsPath } = io.getPaths()
    const info = await stat(stationsPath)
    return info.mtime.toISOString()
  } catch {
    return null
  }
}

export async function runMpzStudioValidation(
  io: MpzContentIo = createMpzContentIo(),
): Promise<MpzValidationReport> {
  const started = Date.now()
  const readErrors: string[] = []

  let stationsFile: StationsFile
  try {
    stationsFile = await io.readStations()
  } catch (err) {
    readErrors.push(err instanceof Error ? err.message : 'stations.json lesen fehlgeschlagen')
    return {
      ok: false,
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      errors: readErrors,
      warnings: [],
      bySlug: {},
      stationSummaries: buildStationOverviews(
        { stations: [] },
        {},
        io.getPaths().appRoot,
      ),
      stationsModifiedAt: await getStationsJsonModifiedAt(io),
    }
  }

  const validation = validateStationsContent(
    stationsFile,
    io.getPaths().appRoot,
  )
  const errors = mergeValidationErrors(validation)
  const { warnings, bySlug } = validation

  const stationSummaries = buildStationOverviews(
    stationsFile,
    bySlug,
    io.getPaths().appRoot,
  )

  const hasStationErrors = stationSummaries.some((s) => s.health === 'error')
  const globalErrors = globalValidationErrors(errors)

  return {
    ok: globalErrors.length === 0 && !hasStationErrors,
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    errors,
    warnings,
    bySlug,
    stationSummaries,
    stationsModifiedAt: await getStationsJsonModifiedAt(io),
  }
}
