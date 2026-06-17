import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import {
  createMpzContentIo,
  type MpzContentIo,
  MpzContentIoError,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  findMediumHotspotReferences,
  isMediaPathStillReferenced,
} from '@/lib/mpz-medium-references'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { Station, StationsFile } from '@/lib/types'

export type FileKeptReason = 'still-referenced' | 'not-local' | 'missing' | 'unlink-failed'

export type RemoveMediumResult = {
  station: Station
  mtime: string | null
  fileDeleted: boolean
  quelle?: string
  fileKeptReason?: FileKeptReason
}

export type MediumRemoveErrorCode = 'NOT_FOUND' | 'HOTSPOT_REFERENCE'

export class MpzStationMedienError extends Error {
  readonly code: MediumRemoveErrorCode
  readonly hotspotIds?: string[]

  constructor(
    code: MediumRemoveErrorCode,
    message: string,
    opts?: { hotspotIds?: string[] },
  ) {
    super(message)
    this.name = 'MpzStationMedienError'
    this.code = code
    this.hotspotIds = opts?.hotspotIds
  }
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!(slug in HUB_SLUG_MAP)) {
    throw new MpzStationMedienError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

export function resolvePublicMediaPath(
  appRoot: string,
  quelle: string,
  slug: string,
): string | null {
  if (!quelle.startsWith(`/media/${slug}/`)) {
    return null
  }
  const mediaRoot = normalize(join(appRoot, 'public', 'media', slug))
  const candidate = normalize(join(appRoot, 'public', quelle.slice(1)))
  const prefix = `${mediaRoot}/`
  if (candidate !== mediaRoot && !candidate.startsWith(prefix)) {
    return null
  }
  return candidate
}

async function tryDeleteMediaFile(
  appRoot: string,
  slug: string,
  quelle: string,
  filteredStation: Station,
): Promise<{ fileDeleted: boolean; fileKeptReason?: FileKeptReason }> {
  if (!quelle.startsWith(`/media/${slug}/`)) {
    return { fileDeleted: false, fileKeptReason: 'not-local' }
  }

  // postValidate validiert vor dem rename und deckt diese Datei-Löschung nicht ab.
  if (isMediaPathStillReferenced(filteredStation, quelle)) {
    return { fileDeleted: false, fileKeptReason: 'still-referenced' }
  }

  const filePath = resolvePublicMediaPath(appRoot, quelle, slug)
  if (!filePath || !existsSync(filePath)) {
    return { fileDeleted: false, fileKeptReason: 'missing' }
  }

  try {
    await unlink(filePath)
    return { fileDeleted: true }
  } catch {
    return { fileDeleted: false, fileKeptReason: 'unlink-failed' }
  }
}

export async function removeStationMedium(
  slug: string,
  mediumId: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<RemoveMediumResult> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const medium = station.medien.find((m) => m.id === mediumId)
    if (!medium) {
      throw new MpzStationMedienError(
        'NOT_FOUND',
        `Medium "${mediumId}" nicht in Station "${slug}" gefunden.`,
      )
    }

    const hotspotRefs = findMediumHotspotReferences(station, mediumId)
    const hotspotIds = [...hotspotRefs.flat, ...hotspotRefs.sphere]
    if (hotspotIds.length > 0) {
      throw new MpzStationMedienError(
        'HOTSPOT_REFERENCE',
        `Medium "${mediumId}" wird von Hotspot(s) referenziert: ${hotspotIds.join(', ')}.`,
        { hotspotIds },
      )
    }

    const quelle = medium.quelle
    const filteredStation: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== mediumId),
    }
    const nextStations = data.stations.map((s) => (s.slug === slug ? filteredStation : s))

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

    const { appRoot } = io.getPaths()
    const fileResult = await tryDeleteMediaFile(appRoot, slug, quelle, filteredStation)

    return {
      station: filteredStation,
      mtime: writeResult.mtime,
      fileDeleted: fileResult.fileDeleted,
      quelle,
      fileKeptReason: fileResult.fileKeptReason,
    }
  })
}


export { MpzContentIoError }
