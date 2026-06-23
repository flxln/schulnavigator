'use client'

import Link from 'next/link'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { MpzCard } from '@/components/mpz-studio/mpz-card'
import { mpzButtonClassName, mpzStackClassName } from '@/components/mpz-studio/mpz-form-primitives'
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
  const { report, loading, error, validateNow, saveInProgress } =
    useStudioValidation()

  const problemStations =
    report?.stationSummaries.filter((s) => s.health !== 'ok') ?? []
  const errorCount = problemStations.filter((s) => s.health === 'error').length
  const warnCount = problemStations.filter((s) => s.health === 'warn').length
  const initialLoading = !report && loading
  const refreshing = Boolean(report && loading)

  return (
    <div className={`mx-auto max-w-4xl ${mpzStackClassName('lg')}`}>
      <header>
        <h1 className="text-2xl font-semibold text-fg-1">Dashboard</h1>
        <p className="mt-1 text-sm text-fg-2">
          Übersicht aller 12 Hub-Stationen — Struktur- und Asset-Validierung nach
          jedem Save. Oben rechts: <strong>Speichern & Validieren</strong>{' '}
          normalisiert die Hub-Reihenfolge und prüft alle Referenzen.
        </p>
      </header>

      {error && (
        <p className="rounded-gs39-md border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-fg-1">
          {error}{' '}
          <Link href="/mpz/unlock" className="font-semibold text-accent underline">
            Entsperren
          </Link>
        </p>
      )}

      {initialLoading ? (
        <DashboardSkeleton />
      ) : report ? (
        <div
          className={refreshing ? 'opacity-70 transition-opacity' : undefined}
        >
          {report.ok ? (
            <MpzCard variant="validation" className="flex items-start gap-3">
              <CheckCircle2
                className="size-8 shrink-0 text-accent"
                aria-hidden
              />
              <div>
                <h2 className="text-lg font-semibold text-fg-1">
                  Status: Alle Stationen valid
                </h2>
                <p className="mt-1 text-sm text-fg-2">
                  Struktur und referenzierte Dateien sind in Ordnung.
                </p>
              </div>
            </MpzCard>
          ) : (
            <MpzCard className="flex items-start gap-3 border-l-4 border-l-error bg-error/5">
              <AlertCircle
                className="size-8 shrink-0 text-error"
                aria-hidden
              />
              <div>
                <h2 className="text-lg font-semibold text-error">
                  {errorCount} Fehler, {warnCount} Warnungen
                </h2>
                <p className="mt-1 text-sm text-fg-2">
                  Bitte die betroffenen Stationen prüfen, bevor du speicherst
                  und veröffentlichst.
                </p>
              </div>
            </MpzCard>
          )}

          <ValidationCards
            report={report}
            loading={loading}
            saveInProgress={saveInProgress}
            errorCount={errorCount}
            warnCount={warnCount}
            onRefresh={() => void validateNow()}
          />

          <MpzCard padding="none">
            <div className="border-b border-border-1 px-mpz-card-padding py-3">
              <h2 className="text-sm font-semibold text-fg-1">
                Stationen mit Problemen
              </h2>
            </div>
            {problemStations.length === 0 ? (
              <p className="px-mpz-card-padding py-6 text-sm text-fg-2">
                Keine Probleme gefunden.
              </p>
            ) : (
              <ul>
                {problemStations.map((st) => (
                  <li
                    key={st.slug}
                    className="border-b border-border-1 last:border-b-0"
                  >
                    <Link
                      href={`/mpz/studio/stationen#${st.slug}`}
                      className="flex flex-col gap-1 px-mpz-card-padding py-3 hover:bg-bg-1"
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
          </MpzCard>

          <MpzCard>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-3">
              Zuletzt geändert
            </h2>
            <p className="mt-2 text-sm text-fg-1">
              <code className="text-fg-2">stations.json</code>
              {report.stationsModifiedAt
                ? ` · ${formatGermanDate(report.stationsModifiedAt)}`
                : ' · —'}
            </p>
          </MpzCard>

          <MpzCard>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-3">
              Werkzeuge
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/mpz/studio/coach"
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                Coach-Nachrichten
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
          </MpzCard>
        </div>
      ) : null}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className={`${mpzStackClassName('md')} animate-pulse`}>
      <div className="h-24 rounded-mpz-card border border-border-1 bg-bg-2" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 rounded-mpz-card border border-border-1 bg-bg-2" />
        <div className="h-32 rounded-mpz-card border border-border-1 bg-bg-2" />
      </div>
      <div className="h-40 rounded-mpz-card border border-border-1 bg-bg-2" />
    </div>
  )
}

function ValidationCards({
  report,
  loading,
  saveInProgress,
  errorCount,
  warnCount,
  onRefresh,
}: {
  report: MpzValidationReport
  loading: boolean
  saveInProgress: boolean
  errorCount: number
  warnCount: number
  onRefresh: () => void
}) {
  const refreshDisabled = loading || saveInProgress
  const okCount = report.stationSummaries.filter((s) => s.health === 'ok').length

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MpzCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-3">
              Validierung
            </h2>
            <p className="mt-1 text-sm text-fg-1">
              {report.ok
                ? 'Alle Stationen valid'
                : `${errorCount} Fehler, ${warnCount} Warnungen`}
            </p>
            <p className="mt-1 text-xs text-fg-3">
              {formatGermanDate(report.checkedAt)} · {report.durationMs} ms
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshDisabled}
            className={`${mpzButtonClassName('secondary')} !min-h-0 px-3 py-1.5 text-xs disabled:opacity-50`}
          >
            {loading && !saveInProgress ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
            ) : null}
            Erneut prüfen
          </button>
        </div>
      </MpzCard>

      <MpzCard>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-3">
          Stationen
        </h2>
        <div className="mt-3 flex gap-6 text-sm">
          <div>
            <p className="text-2xl font-black text-brand-green">{okCount}</p>
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
        <Link
          href="/mpz/studio/stationen"
          className="mt-4 inline-block text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Alle Stationen anzeigen
        </Link>
      </MpzCard>
    </div>
  )
}
