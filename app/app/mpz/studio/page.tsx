import Link from 'next/link'
import { getAllStations } from '@/lib/stations'

const FLAT_CALIB_EXAMPLES = ['kunst', 'hort', 'schulsozialarbeit'] as const
const SPHERE_CALIB_EXAMPLE = 'daz'

export default function MpzStudioPage() {
  const flatSlugs = FLAT_CALIB_EXAMPLES.filter((slug) => {
    const s = getAllStations().find((st) => st.slug === slug)
    return s && (s.viewer ?? 'flat') !== 'equirectangular' && s.bild
  })

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-fg-1">MPZ Studio</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-sun/30 bg-brand-sun/10 px-3 py-1 text-xs font-semibold text-fg-1">
            <span className="size-1.5 rounded-full bg-brand-sun" aria-hidden />
            Nur lokal · development
          </span>
        </div>
        <p className="text-fg-2">
          Dev-only Ingest und Kalibrierung (#145–#149). Stationen-Liste folgt in #151.
        </p>
      </header>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Werkzeuge
        </h2>
        <Link
          href="/mpz/studio/ingest"
          className="block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Medien hochladen
        </Link>
        <Link
          href="/mpz/studio/dialog-audio"
          className="mt-2 block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Dialog-Audio
        </Link>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Hotspot-Kalibrierung (#149)
        </h2>
        <p className="mb-3 text-sm text-fg-2">
          Bestehende Hotspot-IDs in <code className="text-fg-1">stations.json</code>{' '}
          aktualisieren — keine neuen Hotspots anlegen.
        </p>

        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-3">
          Flat (x/y)
        </h3>
        {flatSlugs.length > 0 ? (
          <ul className="mb-4 list-inside list-disc text-sm">
            {flatSlugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/mpz/calib/flat/${slug}`}
                  className="font-semibold text-accent underline-offset-2 hover:underline"
                >
                  /mpz/calib/flat/{slug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-fg-2">
            Keine Flat-Station mit <code className="text-fg-1">bild</code> gefunden.
          </p>
        )}

        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-fg-3">
          Sphere (yaw/pitch)
        </h3>
        <p className="text-sm text-fg-2">
          Zuerst{' '}
          <Link
            href="/mpz/unlock"
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            /mpz/unlock
          </Link>
          , dann{' '}
          <Link
            href={`/raum/${SPHERE_CALIB_EXAMPLE}?hotspot-calib=1`}
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            /raum/{SPHERE_CALIB_EXAMPLE}?hotspot-calib=1
          </Link>
          {' '}— im Overlay „In stations.json übernehmen“.
        </p>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Plan A (Fallback)
        </h2>
        <p className="mb-4 text-fg-2">
          Content-Pflege ohne Studio: CLI, JSON-Schema und Snippets bleiben der
          Pflicht-Pfad für den Projekttag.
        </p>
        <Link
          href="/stationen"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Zur Besucher-App (Stationen)
        </Link>
      </section>
    </main>
  )
}
