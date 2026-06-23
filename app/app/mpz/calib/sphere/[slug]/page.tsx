import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SphereCalibShell } from '@/components/mpz-studio/sphere-calib-shell'
import { getStationBySlug } from '@/lib/stations'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function MpzSphereCalibPage({ params }: PageProps) {
  const { slug } = await params
  const station = getStationBySlug(slug)
  if (!station) {
    notFound()
  }

  const viewer = station.viewer ?? 'flat'
  if (viewer !== 'equirectangular') {
    return (
      <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-10">
        <h1 className="text-2xl font-bold text-fg-1">Sphere-Kalibrierung</h1>
        <p className="text-fg-2">
          Station <strong>{slug}</strong> nutzt den Flat-Viewer — Sphere-Kalibrierung
          ist hier nicht verfügbar.
        </p>
        {station.bild ? (
          <Link
            href={`/mpz/calib/flat/${slug}`}
            className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
          >
            Flat-Kalibrierung: /mpz/calib/flat/{slug}
          </Link>
        ) : null}
        <Link
          href="/mpz/studio/stationen"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Zurück zu Stationen
        </Link>
      </main>
    )
  }

  if (!station.panorama360) {
    notFound()
  }

  return (
    <SphereCalibShell
      slug={station.slug}
      titel={station.titel}
      panorama360={station.panorama360}
      hotspots360={station.hotspots360 ?? []}
      startYaw={station.startYaw}
      startPitch={station.startPitch}
    />
  )
}
