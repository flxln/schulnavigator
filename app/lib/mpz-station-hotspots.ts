import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { resolveIconPublicPath } from '@/lib/mpz-hotspot-icon-ingest'
import { roundNorm } from '@/lib/mpz-hotspot-calib'
import {
  MAX_ICON_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
} from '@/lib/raum-viewer/constants'
import {
  normalizeYawDeg,
  roundDeg,
} from '@/lib/raum-viewer/sphere-marker-conventions'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { Hotspot, Hotspot360, Station, StationsFile, ViewerMode } from '@/lib/types'

export type StationHotspotErrorCode =
  | 'NOT_FOUND'
  | 'NOT_EDITABLE'
  | 'DUPLICATE_ID'
  | 'MEDIUM_NOT_FOUND'
  | 'NO_MEDIAS'
  | 'INVALID_ID'
  | 'INVALID_COORDS'
  | 'INVALID_ICON'
  | 'INVALID_ICON_SIZE'

/** @deprecated Verwende StationHotspotErrorCode */
export type HotspotErrorCode = StationHotspotErrorCode

/** @deprecated Verwende StationHotspotErrorCode */
export type HotspotRemoveErrorCode = StationHotspotErrorCode

const HOTSPOT_ID_RE = /^[a-z0-9][a-z0-9-]*$/

export type AddStationHotspotInput = {
  id: string
  label?: string
  mediumId: string
  x?: number
  y?: number
  yaw?: number
  pitch?: number
  icon?: string
  iconSize?: number
}

export type PatchStationHotspotInput = {
  label?: string
  mediumId?: string
  x?: number
  y?: number
  yaw?: number
  pitch?: number
  icon?: string | null
  iconSize?: number | null
}

export class MpzStationHotspotsError extends Error {
  readonly code: StationHotspotErrorCode

  constructor(code: StationHotspotErrorCode, message: string) {
    super(message)
    this.name = 'MpzStationHotspotsError'
    this.code = code
  }
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!(slug in HUB_SLUG_MAP)) {
    throw new MpzStationHotspotsError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationHotspotsError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

function resolveViewer(station: Station): ViewerMode {
  return station.viewer ?? 'flat'
}

function clampPitch(deg: number): number {
  return roundDeg(deg)
}

function validateHotspotId(id: string): void {
  if (!id || !HOTSPOT_ID_RE.test(id)) {
    throw new MpzStationHotspotsError(
      'INVALID_ID',
      `Hotspot-ID "${id}" ist ungültig (erwartet: Kleinbuchstaben, Ziffern, Bindestriche; z. B. hs-video).`,
    )
  }
}

function validateIconSize(iconSize: number | undefined): number | undefined {
  if (iconSize === undefined) {
    return undefined
  }
  if (!Number.isFinite(iconSize)) {
    throw new MpzStationHotspotsError(
      'INVALID_ICON_SIZE',
      'iconSize muss eine Zahl sein.',
    )
  }
  if (iconSize < MIN_ICON_SIZE_NORM || iconSize > MAX_ICON_SIZE_NORM) {
    throw new MpzStationHotspotsError(
      'INVALID_ICON_SIZE',
      `iconSize muss ${MIN_ICON_SIZE_NORM}–${MAX_ICON_SIZE_NORM} sein.`,
    )
  }
  return iconSize
}

function validateIconPath(
  slug: string,
  icon: string | undefined,
  appRoot: string,
  io: MpzContentIo,
): string | undefined {
  if (icon === undefined || icon === '') {
    return undefined
  }
  const resolved = resolveIconPublicPath(appRoot, slug, icon)
  if (!resolved || !io.fileExists(resolved)) {
    throw new MpzStationHotspotsError(
      'INVALID_ICON',
      `Icon-Pfad "${icon}" ist ungültig oder die Datei fehlt.`,
    )
  }
  return icon
}

function assertFlatCoordsOnly(input: { yaw?: number; pitch?: number }): void {
  if (input.yaw !== undefined || input.pitch !== undefined) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'Flat-Hotspot darf kein yaw/pitch haben.',
    )
  }
}

function assertSphereCoordsOnly(input: { x?: number; y?: number }): void {
  if (input.x !== undefined || input.y !== undefined) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'Sphere-Hotspot darf kein x/y haben.',
    )
  }
}

function buildMergedHotspotInput(
  existing: Hotspot | Hotspot360,
  patch: PatchStationHotspotInput,
): AddStationHotspotInput {
  const merged: AddStationHotspotInput = {
    id: existing.id,
    mediumId: 'mediumId' in patch ? patch.mediumId! : existing.mediumId!,
    label: 'label' in patch ? patch.label : existing.label,
    icon: 'icon' in patch ? (patch.icon ?? undefined) : existing.icon,
    iconSize: 'iconSize' in patch ? (patch.iconSize ?? undefined) : existing.iconSize,
  }

  if ('x' in existing) {
    const flat = existing as Hotspot
    merged.x = 'x' in patch ? patch.x : flat.x
    merged.y = 'y' in patch ? patch.y : flat.y
  } else {
    const sphere = existing as Hotspot360
    merged.yaw = 'yaw' in patch ? patch.yaw : sphere.yaw
    merged.pitch = 'pitch' in patch ? patch.pitch : sphere.pitch
  }

  return merged
}

function buildFlatHotspot(
  input: AddStationHotspotInput,
  slug: string,
  io: MpzContentIo,
): Hotspot {
  assertFlatCoordsOnly(input)
  if (
    input.x === undefined ||
    input.y === undefined ||
    !Number.isFinite(input.x) ||
    !Number.isFinite(input.y)
  ) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'Flat-Hotspot benötigt x und y als Zahlen.',
    )
  }
  if (input.x < 0 || input.x > 1 || input.y < 0 || input.y > 1) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'x und y müssen zwischen 0 und 1 liegen.',
    )
  }

  const iconSize = validateIconSize(input.iconSize)
  const { appRoot } = io.getPaths()
  const icon = validateIconPath(slug, input.icon, appRoot, io)
  const label = input.label?.trim()

  return {
    id: input.id,
    ...(label ? { label } : {}),
    x: roundNorm(input.x),
    y: roundNorm(input.y),
    mediumId: input.mediumId,
    ...(icon ? { icon } : {}),
    ...(iconSize !== undefined ? { iconSize } : {}),
  }
}

function buildSphereHotspot(
  input: AddStationHotspotInput,
  slug: string,
  io: MpzContentIo,
): Hotspot360 {
  assertSphereCoordsOnly(input)
  if (
    input.yaw === undefined ||
    input.pitch === undefined ||
    !Number.isFinite(input.yaw) ||
    !Number.isFinite(input.pitch)
  ) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'Sphere-Hotspot benötigt yaw und pitch als Zahlen.',
    )
  }
  if (input.yaw < -180 || input.yaw > 180) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'yaw muss zwischen −180 und 180 liegen.',
    )
  }
  if (input.pitch < -90 || input.pitch > 90) {
    throw new MpzStationHotspotsError(
      'INVALID_COORDS',
      'pitch muss zwischen −90 und 90 liegen.',
    )
  }

  const iconSize = validateIconSize(input.iconSize)
  const { appRoot } = io.getPaths()
  const icon = validateIconPath(slug, input.icon, appRoot, io)
  const label = input.label?.trim()

  return {
    id: input.id,
    ...(label ? { label } : {}),
    yaw: normalizeYawDeg(input.yaw),
    pitch: clampPitch(input.pitch),
    mediumId: input.mediumId,
    ...(icon ? { icon } : {}),
    ...(iconSize !== undefined ? { iconSize } : {}),
  }
}

const REBUILT_HOTSPOT_KEYS = [
  'label',
  'mediumId',
  'icon',
  'iconSize',
  'x',
  'y',
  'yaw',
  'pitch',
] as const

function mergeBuiltHotspot(
  existing: Hotspot | Hotspot360,
  built: Hotspot | Hotspot360,
): Hotspot | Hotspot360 {
  const preserved = { ...existing } as Record<string, unknown>
  for (const key of REBUILT_HOTSPOT_KEYS) {
    delete preserved[key]
  }
  return { ...preserved, ...built }
}

function hasDialogHotspot(hotspots: Array<Hotspot | Hotspot360> | undefined): boolean {
  return (hotspots ?? []).some((hs) => hs.action === 'dialog')
}

function warnOrphanedDialog(slug: string): void {
  console.warn(
    `[mpz-studio] Station "${slug}": station.dialog ist verwaist — kein Dialog-Hotspot mehr vorhanden.`,
  )
}

export async function addStationHotspot(
  slug: string,
  input: AddStationHotspotInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ station: Station; mtime: string | null }> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const viewer = resolveViewer(station)

    if (!station.medien?.length) {
      throw new MpzStationHotspotsError(
        'NO_MEDIAS',
        `Station "${slug}" hat keine Medien — zuerst Medium ingestieren.`,
      )
    }

    validateHotspotId(input.id)

    const existingIds = new Set([
      ...(station.hotspots ?? []).map((h) => h.id),
      ...(station.hotspots360 ?? []).map((h) => h.id),
    ])
    if (existingIds.has(input.id)) {
      throw new MpzStationHotspotsError(
        'DUPLICATE_ID',
        `Hotspot-ID "${input.id}" existiert bereits in Station "${slug}".`,
      )
    }

    if (!station.medien.some((m) => m.id === input.mediumId)) {
      throw new MpzStationHotspotsError(
        'MEDIUM_NOT_FOUND',
        `Medium "${input.mediumId}" nicht in Station "${slug}" gefunden.`,
      )
    }

    let nextStation: Station

    if (viewer === 'equirectangular') {
      const hotspot = buildSphereHotspot(input, slug, io)
      const hotspots360 = [...(station.hotspots360 ?? []), hotspot]
      nextStation = { ...station, hotspots360 }
    } else {
      const hotspot = buildFlatHotspot(input, slug, io)
      const hotspots = [...(station.hotspots ?? []), hotspot]
      nextStation = { ...station, hotspots }
    }

    const nextStations = data.stations.map((s) => (s.slug === slug ? nextStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    return { station: nextStation, mtime: writeResult.mtime }
  })
}

export async function removeStationHotspot(
  slug: string,
  hotspotId: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ station: Station; mtime: string | null }> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const viewer = resolveViewer(station)

    let nextStation: Station

    if (viewer === 'equirectangular') {
      const hotspots360 = station.hotspots360
      if (!hotspots360?.some((h) => h.id === hotspotId)) {
        throw new MpzStationHotspotsError(
          'NOT_FOUND',
          `Hotspot "${hotspotId}" nicht in Station "${slug}" gefunden.`,
        )
      }
      const filtered = hotspots360.filter((h) => h.id !== hotspotId)
      nextStation = {
        ...station,
        hotspots360: filtered.length > 0 ? filtered : undefined,
      }
      if (
        station.dialog !== undefined &&
        !hasDialogHotspot(nextStation.hotspots360)
      ) {
        warnOrphanedDialog(slug)
      }
    } else {
      const hotspots = station.hotspots
      if (!hotspots?.some((h) => h.id === hotspotId)) {
        throw new MpzStationHotspotsError(
          'NOT_FOUND',
          `Hotspot "${hotspotId}" nicht in Station "${slug}" gefunden.`,
        )
      }
      const filtered = hotspots.filter((h) => h.id !== hotspotId)
      nextStation = {
        ...station,
        hotspots: filtered.length > 0 ? filtered : undefined,
      }
      if (station.dialog !== undefined && !hasDialogHotspot(nextStation.hotspots)) {
        warnOrphanedDialog(slug)
      }
    }

    const nextStations = data.stations.map((s) => (s.slug === slug ? nextStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    return { station: nextStation, mtime: writeResult.mtime }
  })
}

export async function patchStationHotspot(
  slug: string,
  hotspotId: string,
  patch: PatchStationHotspotInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ station: Station; mtime: string | null }> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const viewer = resolveViewer(station)

    const hotspots = viewer === 'equirectangular' ? station.hotspots360 : station.hotspots
    const existing = hotspots?.find((h) => h.id === hotspotId)

    if (!existing) {
      throw new MpzStationHotspotsError(
        'NOT_FOUND',
        `Hotspot "${hotspotId}" nicht in Station "${slug}" gefunden.`,
      )
    }

    if (existing.action === 'dialog') {
      throw new MpzStationHotspotsError(
        'NOT_EDITABLE',
        'Dialog-Hotspot kann nicht bearbeitet werden.',
      )
    }

    if (viewer === 'equirectangular') {
      assertSphereCoordsOnly(patch)
    } else {
      assertFlatCoordsOnly(patch)
    }

    if ('mediumId' in patch) {
      if (!station.medien?.some((m) => m.id === patch.mediumId)) {
        throw new MpzStationHotspotsError(
          'MEDIUM_NOT_FOUND',
          `Medium "${patch.mediumId}" nicht in Station "${slug}" gefunden.`,
        )
      }
    }

    // Merge-Objekt MUSS vor Range-Validierung gebaut werden — buildFlatHotspot wirft bei x===undefined.
    const merged = buildMergedHotspotInput(existing, patch)

    let built: Hotspot | Hotspot360
    if (viewer === 'equirectangular') {
      built = buildSphereHotspot(merged, slug, io)
    } else {
      built = buildFlatHotspot(merged, slug, io)
    }

    const nextHotspot = mergeBuiltHotspot(existing, built)

    let nextStation: Station
    if (viewer === 'equirectangular') {
      const hotspots360 = (station.hotspots360 ?? []).map((h) =>
        h.id === hotspotId ? (nextHotspot as Hotspot360) : h,
      )
      nextStation = { ...station, hotspots360 }
    } else {
      const nextHotspots = (station.hotspots ?? []).map((h) =>
        h.id === hotspotId ? (nextHotspot as Hotspot) : h,
      )
      nextStation = { ...station, hotspots: nextHotspots }
    }

    const nextStations = data.stations.map((s) => (s.slug === slug ? nextStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    return { station: nextStation, mtime: writeResult.mtime }
  })
}
