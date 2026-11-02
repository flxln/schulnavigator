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
import { getAllSlugs, getAllStations, getStationBySlug } from '@/lib/stations'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllSlugs()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const station = getStationBySlug(slug)
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
  const station = getStationBySlug(slug)
  if (!station) {
    notFound()
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  const access = validateToken(token)
  const mode = access?.mode ?? 'heft'

  const stations = getAllStations()
  const validSlugs = stations.map((s) => s.slug)
  const hubStations = buildHubStations(stations)
  const hubStation = hubStations.find((s) => s.slug === slug)
  if (!hubStation) {
    notFound()
  }

  const { slotId } = getHubMapping(slug)

  return (
    <main
      className="sn-page-container min-h-[100svh] pb-[max(3rem,env(safe-area-inset-bottom))]"
      data-hub-slot={slotId}
    >
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
