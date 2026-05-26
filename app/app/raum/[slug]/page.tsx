import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RaumStationClient } from '@/components/raum-station-client'
import { StationVisitRecorder } from '@/components/station-visit-recorder'
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

  const validSlugs = getAllStations().map((s) => s.slug)

  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8"
      data-puzzle-segment={station.puzzleSegmentId}
    >
      <StationVisitRecorder slug={slug} validSlugs={validSlugs} />
      <RaumStationClient station={station} validSlugs={validSlugs} />
    </main>
  )
}
