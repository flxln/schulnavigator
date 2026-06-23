'use client'

import Link from 'next/link'
import { MpzCard } from '@/components/mpz-studio/mpz-card'
import { mpzStackClassName } from '@/components/mpz-studio/mpz-form-primitives'
import {
  healthDotClass,
  healthLabel,
} from '@/components/mpz-studio/mpz-studio-health'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'
import type { MpzStationOverview } from '@/lib/mpz-studio-overview'

function viewerLabel(viewer: MpzStationOverview['viewer']): string {
  return viewer === 'equirectangular' ? '360°' : 'flat'
}

function StationCard({ st }: { st: MpzStationOverview }) {
  const calib = mpzStationCalibHref({
    viewer: st.viewer,
    slug: st.slug,
    hasBild: st.hasBild,
    hasPanorama360: st.hasPanorama360,
  })
  const detailHref = `/mpz/studio/stationen/${encodeURIComponent(st.slug)}`

  return (
    <MpzCard
      id={st.slug}
      className="relative scroll-mt-24 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-fg-3">
            #{String(st.hubNr).padStart(2, '0')}
          </p>
          <h2 className="text-base font-bold text-fg-1">{st.titel}</h2>
          <p className="font-mono text-xs text-fg-3">{st.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`size-3 rounded-full ${healthDotClass(st.health)}`}
            title={healthLabel(st.health)}
            aria-hidden
          />
          <span className="sr-only">— {healthLabel(st.health)}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="rounded bg-bg-1 px-2 py-0.5 text-xs font-semibold text-fg-3">
          {viewerLabel(st.viewer)}
        </span>
      </div>

      {st.health !== 'ok' && st.issues.length > 0 && (
        <ul className="mb-3 space-y-0.5 text-xs text-fg-3">
          {st.issues.map((issue) => (
            <li key={issue}>— {issue}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-border-1 pt-3 text-sm">
        <Link
          href={detailHref}
          aria-label={`${st.titel} bearbeiten`}
          className="font-semibold text-accent underline-offset-2 before:absolute before:inset-0 hover:underline"
        >
          Bearbeiten
        </Link>
        <Link
          href={`/raum/${st.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 font-semibold text-accent underline-offset-2 hover:underline"
        >
          ↗ Vorschau /raum/{st.slug}
        </Link>
        {calib && (
          <Link
            href={calib}
            className="relative z-10 font-semibold text-accent underline-offset-2 hover:underline"
          >
            {st.viewer === 'equirectangular'
              ? 'Kalibrieren (Hotspots + Startblick)'
              : 'Hotspot kalibrieren'}
          </Link>
        )}
        <Link
          href={`${detailHref}?tab=medien`}
          className="relative z-10 text-fg-2 underline-offset-2 hover:text-accent hover:underline"
        >
          Medien hochladen
        </Link>
      </div>
    </MpzCard>
  )
}

function StationGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-mpz-card border border-border-1 bg-bg-2"
        />
      ))}
    </div>
  )
}

export function StationGrid() {
  const { report, loading, error } = useStudioValidation()

  const stations = report?.stationSummaries ?? []
  const initialLoading = !report && loading
  const refreshing = Boolean(report && loading)

  return (
    <div className={`mx-auto max-w-7xl ${mpzStackClassName('lg')}`}>
      <header>
        <h1 className="text-2xl font-semibold text-fg-1">Stationen</h1>
        <p className="mt-1 max-w-3xl text-sm text-fg-2">
          12 Stationen · Schulrundgang GS39. Kachel anklicken oder Bearbeiten
          öffnet die Detailansicht. Vorschau startet die Besucher-App in einem
          neuen Tab.
        </p>
      </header>

      {error && (
        <p className="rounded-gs39-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-fg-1">
          {error}{' '}
          <Link href="/mpz/unlock" className="font-semibold text-accent underline">
            Entsperren
          </Link>
        </p>
      )}

      {initialLoading ? (
        <StationGridSkeleton />
      ) : (
        <div
          className={
            refreshing ? 'opacity-70 transition-opacity' : undefined
          }
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stations.map((st) => (
              <StationCard key={st.slug} st={st} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
