import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { RaumStationClient } from '@/components/raum-station-client'
import { StationVisitRecorder } from '@/components/station-visit-recorder'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import {
  buildHubStations,
  getHubMapping,
} from '@/lib/schoolhouse-hub-map'
import { getAllSlugs, getAllStations } from '@/lib/stations'
import { getStationsForRequest } from '@/lib/stations-directus'
import type { Station } from '@/lib/types'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

/**
 * Spike #251 (Wegwerf, nicht gemergt): Quellen-Weiche NUR an dieser
 * Konsumstelle (Pre-Mortem 1a F2) — `stations.ts` bleibt sync/JSON-only,
 * damit `generateStaticParams()` build-unabhängig von Directus bleibt.
 * `SN_STATIONS_SOURCE` ist runtime-only (Pre-Mortem 1b L4); der Build läuft
 * per Konstruktion immer gegen `getAllStations()`.
 */
async function resolveStations(): Promise<readonly Station[]> {
  if (process.env.SN_STATIONS_SOURCE === 'directus') {
    return getStationsForRequest()
  }
  return getAllStations()
}

export function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const stations = await resolveStations()
  const station = stations.find((s) => s.slug === slug)
  if (!station) {
    return { title: 'Station nicht gefunden' }
  }
  return {
    title: station.titel,
    description: station.beschreibung.slice(0, 160),
    openGraph: { title: station.titel },
  }
}

export default async function RaumPage({ params }: PageProps) {
  const { slug } = await params
  const stations = await resolveStations()
  const station = stations.find((s) => s.slug === slug)
  if (!station) {
    notFound()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  const access = validateToken(token)
  const mode = access?.mode ?? 'heft'

  const validSlugs = stations.map((s) => s.slug)
  const hubStations = buildHubStations(stations)
  const hubStation = hubStations.find((s) => s.slug === slug)
  if (!hubStation) {
    notFound()
  }

  const { slotId } = getHubMapping(slug)

  return (
    <main className="sn-page-container min-h-[100svh]" data-hub-slot={slotId}>
      <StationVisitRecorder
        slug={slug}
        validSlugs={validSlugs}
        mode={mode}
      />
      <RaumStationClient
        station={station}
        validSlugs={validSlugs}
        hubStation={hubStation}
        hubStations={hubStations}
        mode={mode}
      />
    </main>
  )
}
