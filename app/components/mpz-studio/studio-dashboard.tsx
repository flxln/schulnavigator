'use client'

import Link from 'next/link'
import { useMediaIngest } from '@/components/mpz-studio/media-ingest-modal-context'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'

function formatGermanDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function StudioDashboard() {
  const { openMediaIngest } = useMediaIngest()
  const { report, loading, error, validateNow } = useStudioValidation()

  const problemStations =
    report?.stationSummaries.filter((s) => s.health !== 'ok') ?? []
  const errorCount = problemStations.filter((s) => s.health === 'error').length
  const warnCount = problemStations.filter((s) => s.health === 'warn').length

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <p className="text-sm text-fg-2">
        Übersicht aller 12 Hub-Stationen — Struktur- und Asset-Validierung nach jedem
        Save (#150). Oben rechts: <strong>Speichern & Validieren</strong> normalisiert
        die Hub-Reihenfolge und prüft alle Referenzen.
      </p>

      {error && (
        <p className="rounded-gs39-md border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-fg-1">
          {error}{' '}
          <Link href="/mpz/unlock" className="font-semibold text-accent underline">
            Entsperren
          </Link>
        </p>
      )}

      <ValidationCards
        report={report}
        loading={loading}
        errorCount={errorCount}
        warnCount={warnCount}
        onRefresh={() => void validateNow()}
      />

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-0 shadow-gs39-sm">
        <div className="border-b border-border-1 px-4 py-3">
          <h2 className="text-sm font-semibold text-fg-1">Stationen mit Problemen</h2>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-fg-2">Laden…</p>
        ) : problemStations.length === 0 ? (
          <p className="px-4 py-6 text-sm text-fg-2">Keine Probleme gefunden.</p>
        ) : (
          <ul>
            {problemStations.map((st) => (
              <li key={st.slug} className="border-b border-border-1 last:border-b-0">
                <Link
                  href={`/mpz/studio/stationen#${st.slug}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-bg-1"
                >
                  <span className="font-semibold text-fg-1">{st.titel}</span>
                  {st.issues.map((issue) => (
                    <span key={issue} className="text-xs text-fg-3">
                      — {issue}
                    </span>
                  ))}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Zuletzt geändert
        </h2>
        <p className="mt-2 text-sm text-fg-1">
          <code className="text-fg-2">stations.json</code>
          {report?.stationsModifiedAt
            ? ` · ${formatGermanDate(report.stationsModifiedAt)}`
            : ' · —'}
        </p>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-3">
          Werkzeuge
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          <button
            type="button"
            onClick={() => openMediaIngest()}
            className="text-left font-semibold text-accent underline-offset-2 hover:underline"
          >
            Medien hochladen
          </button>
          <Link
            href="/mpz/studio/dialog-audio"
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            Dialog-Audio
          </Link>
          <a
            href="https://github.com/flxln/schulnavigator/blob/main/anleitungen/content-einpflegen.md"
            className="font-semibold text-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Plan A — CLI-Anleitung
          </a>
        </div>
      </section>
    </div>
  )
}

function ValidationCards({
  report,
  loading,
  errorCount,
  warnCount,
  onRefresh,
}: {
  report: MpzValidationReport | null
  loading: boolean
  errorCount: number
  warnCount: number
  onRefresh: () => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
              Validierung
            </h2>
            {loading ? (
              <p className="mt-1 text-sm text-fg-2">Prüfe Struktur und Dateien…</p>
            ) : report ? (
              <p className="mt-1 text-sm text-fg-1">
                {report.ok
                  ? 'Alle Stationen valid'
                  : `${errorCount} Fehler, ${warnCount} Warnungen`}
              </p>
            ) : null}
            {report && !loading && (
              <p className="mt-1 text-xs text-fg-3">
                {formatGermanDate(report.checkedAt)} · {report.durationMs} ms
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-1.5 text-xs font-semibold text-fg-1 hover:bg-bg-2 disabled:opacity-50"
          >
            Erneut prüfen
          </button>
        </div>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Stationen
        </h2>
        {report && !loading && (
          <div className="mt-3 flex gap-6 text-sm">
            <div>
              <p className="text-2xl font-black text-brand-green">
                {report.stationSummaries.filter((s) => s.health === 'ok').length}
              </p>
              <p className="text-xs text-fg-3">Valid</p>
            </div>
            <div>
              <p className="text-2xl font-black text-brand-sun">{warnCount}</p>
              <p className="text-xs text-fg-3">Warnungen</p>
            </div>
            <div>
              <p className="text-2xl font-black text-brand-red">{errorCount}</p>
              <p className="text-xs text-fg-3">Fehler</p>
            </div>
          </div>
        )}
        <Link
          href="/mpz/studio/stationen"
          className="mt-4 inline-block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Alle Stationen anzeigen
        </Link>
      </section>
    </div>
  )
}
