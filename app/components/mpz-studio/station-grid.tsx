'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { mpzStationCalibHref } from '@/lib/mpz-studio-calib'
import type { MpzStationOverview, MpzValidationReport } from '@/lib/mpz-studio-overview'

function healthDotClass(health: MpzStationOverview['health']): string {
  if (health === 'ok') return 'bg-brand-green'
  if (health === 'warn') return 'bg-brand-sun'
  return 'bg-brand-red'
}

function viewerLabel(viewer: MpzStationOverview['viewer']): string {
  return viewer === 'equirectangular' ? '360°' : 'flat'
}

export function StationGrid() {
  const [report, setReport] = useState<MpzValidationReport | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mpz/validate')
      if (res.ok) {
        setReport((await res.json()) as MpzValidationReport)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const stations = report?.stationSummaries ?? []

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-6 text-sm text-fg-2">
        12 Stationen · Schulrundgang GS39. Vorschau öffnet die Besucher-App in einem
        neuen Tab.
      </p>

      {loading ? (
        <p className="text-sm text-fg-2">Laden…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((st) => {
            const calib = mpzStationCalibHref({
              viewer: st.viewer,
              slug: st.slug,
              hasBild: st.hasBild,
            })
            return (
              <article
                key={st.slug}
                id={st.slug}
                className="scroll-mt-24 rounded-gs39-md border border-border-1 bg-bg-2 p-4 shadow-gs39-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-fg-3">
                      #{st.hubNr}
                    </p>
                    <h2 className="text-base font-bold text-fg-1">{st.titel}</h2>
                    <p className="font-mono text-xs text-fg-3">{st.slug}</p>
                  </div>
                  <span
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${healthDotClass(st.health)}`}
                    title={st.health}
                    aria-hidden
                  />
                </div>

                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-border-1 px-2 py-0.5 font-semibold text-fg-2">
                    {viewerLabel(st.viewer)}
                  </span>
                  <span className="text-fg-3">
                    {st.medienCount} Medien · {st.hotspotCount} Hotspots
                  </span>
                </div>

                {st.issues.length > 0 && (
                  <ul className="mb-3 space-y-0.5 text-xs text-fg-3">
                    {st.issues.map((issue) => (
                      <li key={issue}>— {issue}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-2 border-t border-border-1 pt-3 text-sm">
                  <Link
                    href={`/mpz/studio/stationen/${encodeURIComponent(st.slug)}`}
                    className="font-semibold text-accent underline-offset-2 hover:underline"
                  >
                    Bearbeiten
                  </Link>
                  <Link
                    href={`/raum/${st.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent underline-offset-2 hover:underline"
                  >
                    ↗ Vorschau /raum/{st.slug}
                  </Link>
                  {calib && (
                    <Link
                      href={calib}
                      className="font-semibold text-accent underline-offset-2 hover:underline"
                    >
                      {st.viewer === 'equirectangular'
                        ? 'Kalibrieren (Hotspots + Startblick)'
                        : 'Hotspot kalibrieren'}
                    </Link>
                  )}
                  <Link
                    href={`/mpz/studio/stationen/${encodeURIComponent(st.slug)}?tab=medien`}
                    className="text-fg-2 underline-offset-2 hover:text-accent hover:underline"
                  >
                    Medien hochladen
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
