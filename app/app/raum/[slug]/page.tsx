import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MediaSlotList } from '@/components/media-slot-list'
import {
  RaumViewer,
  RaumViewerErrorBoundary,
  StaticRoomFallback,
} from '@/components/raum-viewer'
import { StationBackLink } from '@/components/station-back-link'
import { getAllSlugs, getStationBySlug } from '@/lib/stations'

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

  const puzzleAttr =
    station.puzzleSegmentId !== undefined
      ? { 'data-puzzle-segment': station.puzzleSegmentId }
      : {}

  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8"
      {...puzzleAttr}
    >
      <StationBackLink />
      <section
        role="region"
        aria-labelledby="station-titel"
        className="flex flex-col gap-3"
      >
        <RaumViewerErrorBoundary>
          {station.bild ? (
            <RaumViewer
              bild={station.bild}
              alt={`Raumansicht ${station.titel}`}
              hotspots={station.hotspots}
              medien={station.medien}
            />
          ) : (
            <StaticRoomFallback titel={station.titel} />
          )}
        </RaumViewerErrorBoundary>
        <p className="text-center">
          <Link
            href="#medien"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            Zu den Medien
          </Link>
        </p>
      </section>
      <header>
        <h1 id="station-titel" className="text-2xl font-semibold text-zinc-900">
          {station.titel}
        </h1>
        <p className="mt-4 whitespace-pre-wrap text-zinc-700 leading-relaxed">
          {station.beschreibung}
        </p>
      </header>
      <MediaSlotList medien={station.medien} />
    </main>
  )
}
