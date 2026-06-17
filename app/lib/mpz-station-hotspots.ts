import {
  createMpzContentIo,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { Hotspot, Hotspot360, Station, StationsFile, ViewerMode } from '@/lib/types'

export type HotspotRemoveErrorCode = 'NOT_FOUND'

export class MpzStationHotspotsError extends Error {
  readonly code: HotspotRemoveErrorCode

  constructor(code: HotspotRemoveErrorCode, message: string) {
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

function hasDialogHotspot(hotspots: Array<Hotspot | Hotspot360> | undefined): boolean {
  return (hotspots ?? []).some((hs) => hs.action === 'dialog')
}

function warnOrphanedDialog(slug: string): void {
  console.warn(
    `[mpz-studio] Station "${slug}": station.dialog ist verwaist — kein Dialog-Hotspot mehr vorhanden.`,
  )
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
