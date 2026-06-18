import {
  createMpzContentIo,
  type MpzContentIo,
  MpzContentIoError,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { Station, StationsFile, ViewerMode } from '@/lib/types'
import { getViewerChangeWarnings, type ViewerChangeWarning } from '@/lib/mpz-viewer-warnings'

export type StammdatenPatch = {
  titel?: string
  beschreibung?: string
  viewer?: ViewerMode
}

export type StammdatenErrorCode =
  | 'NOT_FOUND'
  | 'EMPTY_FIELD'
  | 'NO_FIELDS'
  | 'INVALID_VIEWER'

export class MpzStationStammdatenError extends Error {
  readonly code: StammdatenErrorCode

  constructor(code: StammdatenErrorCode, message: string) {
    super(message)
    this.name = 'MpzStationStammdatenError'
    this.code = code
  }
}

function resolveViewer(station: Station): ViewerMode {
  return station.viewer ?? 'flat'
}

function applyViewerToStation(station: Station, viewer: ViewerMode): Station {
  if (viewer === 'flat') {
    const { viewer: _removed, ...rest } = station
    return rest as Station
  }
  return { ...station, viewer: 'equirectangular' }
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!(slug in HUB_SLUG_MAP)) {
    throw new MpzStationStammdatenError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationStammdatenError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

function normalizePatch(patch: StammdatenPatch): {
  titel?: string
  beschreibung?: string
  viewer?: ViewerMode
} {
  const keys = Object.keys(patch) as (keyof StammdatenPatch)[]
  if (keys.length === 0) {
    throw new MpzStationStammdatenError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  const normalized: StammdatenPatch = {}

  if (patch.titel !== undefined) {
    const titel = patch.titel.trim()
    if (!titel) {
      throw new MpzStationStammdatenError('EMPTY_FIELD', 'titel darf nicht leer sein.')
    }
    normalized.titel = titel
  }

  if (patch.beschreibung !== undefined) {
    const beschreibung = patch.beschreibung.trim()
    if (!beschreibung) {
      throw new MpzStationStammdatenError(
        'EMPTY_FIELD',
        'beschreibung darf nicht leer sein.',
      )
    }
    normalized.beschreibung = beschreibung
  }

  if (patch.viewer !== undefined) {
    if (patch.viewer !== 'flat' && patch.viewer !== 'equirectangular') {
      throw new MpzStationStammdatenError(
        'INVALID_VIEWER',
        'viewer muss flat oder equirectangular sein.',
      )
    }
    normalized.viewer = patch.viewer
  }

  return normalized
}

export async function readStationStammdaten(
  slug: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<Station> {
  const data = await io.readStations()
  return findHubStation(data, slug)
}

export type PatchStationStammdatenResult = {
  station: Station
  mtime: string | null
  warnings: ViewerChangeWarning[]
}

export async function patchStationStammdaten(
  slug: string,
  patch: StammdatenPatch,
  io: MpzContentIo = createMpzContentIo(),
): Promise<PatchStationStammdatenResult> {
  return withMpzWriteLock(async () => {
    const normalized = normalizePatch(patch)
    const data = await io.readStations()
    const before = findHubStation(data, slug)

    let next: Station = { ...before, ...normalized }
    if (normalized.viewer !== undefined) {
      next = applyViewerToStation(next, normalized.viewer)
    }

    const nextViewer = resolveViewer(next)
    const warnings = getViewerChangeWarnings(before, nextViewer)

    const nextStations = data.stations.map((s) => (s.slug === slug ? next : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        postValidate: true,
        makeBackup: true,
        touchedSlugs: [slug],
      },
    )

    const written = nextStations.find((s) => s.slug === slug)
    if (!written) {
      throw new MpzStationStammdatenError('NOT_FOUND', `Station "${slug}" nicht gefunden.`)
    }

    return {
      station: written,
      mtime: writeResult.mtime,
      warnings,
    }
  })
}

export { MpzContentIoError }
