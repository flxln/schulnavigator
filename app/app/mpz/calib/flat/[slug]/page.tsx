import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FlatCalibShell } from '@/components/mpz-studio/flat-calib-shell'
import { getStationBySlug } from '@/lib/stations'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function MpzFlatCalibPage({ params }: PageProps) {
  const { slug } = await params
  const station = getStationBySlug(slug)
  if (!station) {
    notFound()
  }

  const viewer = station.viewer ?? 'flat'
  if (viewer === 'equirectangular') {
    return (
      <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold text-fg-1">Flat-Kalibrierung</h1>
        <p className="text-fg-2">
          Station <strong>{slug}</strong> nutzt den Sphere-Viewer — Flat-Kalibrierung
          ist hier nicht verfügbar.
        </p>
        <Link
          href={`/raum/${slug}?hotspot-calib=1`}
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Sphere-Kalibrierung: /raum/{slug}?hotspot-calib=1
        </Link>
        <Link
          href="/mpz/studio/stationen"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Zurück zu Stationen
        </Link>
      </main>
    )
  }

  if (!station.bild) {
    notFound()
  }

  return (
    <FlatCalibShell
      slug={station.slug}
      titel={station.titel}
      bild={station.bild}
      hotspots={station.hotspots ?? []}
      startPanX={station.startPanX}
    />
  )
}
