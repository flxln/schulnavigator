import type { Medium, Station } from '@/lib/types'
import raw from '@/data/stations.json'
import { validateStationsFile } from '@/lib/validate-stations'

function loadStations(): Station[] {
  return validateStationsFile(raw as unknown)
}

const stations = loadStations()

const bySlug = new Map(stations.map((s) => [s.slug, s]))

export function getAllStations(): readonly Station[] {
  return stations
}

export function getStationBySlug(slug: string): Station | undefined {
  return bySlug.get(slug)
}

export function getAllSlugs(): { slug: string }[] {
  return stations.map((s) => ({ slug: s.slug }))
}

export function getMediumById(
  station: Station,
  mediumId: string,
): Medium | undefined {
  return station.medien.find((m) => m.id === mediumId)
}
