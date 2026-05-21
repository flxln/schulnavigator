import type { Station, StationsFile } from '@/lib/types'
import raw from '@/data/stations.json'

function loadStations(): Station[] {
  const data = raw as StationsFile
  return data.stations
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
