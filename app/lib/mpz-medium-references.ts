import type { Station } from '@/lib/types'

export function findMediumHotspotReferences(
  station: Pick<Station, 'hotspots' | 'hotspots360'>,
  mediumId: string,
): { flat: string[]; sphere: string[] } {
  const flat: string[] = []
  const sphere: string[] = []

  for (const hs of station.hotspots ?? []) {
    if (hs.action === 'dialog') continue
    if (hs.mediumId === mediumId) {
      flat.push(hs.id)
    }
  }

  for (const hs of station.hotspots360 ?? []) {
    if (hs.action === 'dialog') continue
    if (hs.mediumId === mediumId) {
      sphere.push(hs.id)
    }
  }

  return { flat, sphere }
}

function pushPath(paths: string[], value: string | undefined): void {
  if (value?.trim()) {
    paths.push(value.trim())
  }
}

export function collectStationMediaPaths(station: Station): string[] {
  const paths: string[] = []

  pushPath(paths, station.bild)
  pushPath(paths, station.panorama360)

  for (const medium of station.medien ?? []) {
    pushPath(paths, medium.quelle)
    pushPath(paths, medium.poster)
    pushPath(paths, medium.thumbnail)
  }

  for (const hs of station.hotspots ?? []) {
    pushPath(paths, hs.icon)
  }

  for (const hs of station.hotspots360 ?? []) {
    pushPath(paths, hs.icon)
  }

  for (const segment of station.dialog?.segmente ?? []) {
    pushPath(paths, segment.quelle)
  }

  return paths
}

export function isMediaPathStillReferenced(station: Station, path: string): boolean {
  return collectStationMediaPaths(station).includes(path)
}
