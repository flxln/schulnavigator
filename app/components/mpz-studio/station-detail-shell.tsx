'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'
import { StationStammdatenForm } from '@/components/mpz-studio/station-stammdaten-form'
import { StationMedienTable } from '@/components/mpz-studio/station-medien-table'
import type { Station, ViewerMode } from '@/lib/types'

const VALID_TABS = ['stammdaten', 'medien', 'hotspots', 'dialog-audio'] as const
type DetailTab = (typeof VALID_TABS)[number]

export type StationDetailShellProps = {
  station: Station | null
  slug: string
  hubNr: number
}

function viewerLabel(viewer: ViewerMode): string {
  return viewer === 'equirectangular' ? '360°' : 'flat'
}

function healthDotClass(health: 'ok' | 'warn' | 'error'): string {
  if (health === 'ok') return 'bg-brand-green'
  if (health === 'warn') return 'bg-brand-sun'
  return 'bg-brand-red'
}

function calibHref(station: Station | null, slug: string): string | null {
  if (!station) return null
  const viewer = station.viewer ?? 'flat'
  if (viewer === 'equirectangular') {
    return `/raum/${slug}?hotspot-calib=1`
  }
  if (viewer === 'flat' && station.bild) {
    return `/mpz/calib/flat/${slug}`
  }
  return null
}

function resolveTab(raw: string | null): DetailTab {
  if (raw && VALID_TABS.includes(raw as DetailTab)) {
    return raw as DetailTab
  }
  return 'stammdaten'
}

export function StationDetailShell({
  station,
  slug,
  hubNr,
}: StationDetailShellProps) {
  const searchParams = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))
  const { report } = useStudioValidation()

  const summary = report?.stationSummaries.find((s) => s.slug === slug)
  const titel = station?.titel ?? summary?.titel ?? slug
  const viewer = station?.viewer ?? summary?.viewer ?? 'flat'
  const health = summary?.health ?? (station ? 'ok' : 'error')
  const issues = summary?.issues ?? []
  const hasDialog = summary?.hasDialog ?? false
  const medienCount = station?.medien?.length ?? summary?.medienCount ?? 0
  const hotspotCount =
    (station?.hotspots?.length ?? 0) + (station?.hotspots360?.length ?? 0) ||
    summary?.hotspotCount ||
    0
  const calib = calibHref(station, slug)

  const tabs: { id: DetailTab; label: string; badge?: number; hidden?: boolean }[] =
    [
      { id: 'stammdaten', label: 'Stammdaten' },
      { id: 'medien', label: 'Medien', badge: medienCount },
      { id: 'hotspots', label: 'Hotspots', badge: hotspotCount || undefined },
      {
        id: 'dialog-audio',
        label: 'Dialog-Audio',
        hidden: !hasDialog,
      },
    ]

  const baseHref = `/mpz/studio/stationen/${encodeURIComponent(slug)}`

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/mpz/studio/stationen"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Alle Stationen
        </Link>
        <span className="hidden h-5 w-px bg-border-1 sm:block" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-fg-3">
            #{hubNr}
          </span>
          <h2 className="text-xl font-bold text-fg-1">{titel}</h2>
          <span className="rounded-full border border-border-1 px-2 py-0.5 text-xs font-semibold text-fg-2">
            {viewerLabel(viewer)}
          </span>
          <span
            className={`size-2.5 rounded-full ${healthDotClass(health)}`}
            title={health}
            aria-hidden
          />
        </div>
        <Link
          href={`/raum/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ↗ Vorschau /raum/{slug}
        </Link>
      </div>

      {issues.length > 0 && (
        <ul className="mb-4 rounded-gs39-md border border-border-1 bg-bg-2 px-4 py-3 text-sm text-fg-2">
          {issues.map((issue) => (
            <li key={issue}>— {issue}</li>
          ))}
        </ul>
      )}

      <nav
        className="mb-6 flex flex-wrap gap-1 border-b border-border-1"
        aria-label="Station bearbeiten"
      >
        {tabs
          .filter((tab) => !tab.hidden)
          .map((tab) => {
            const active = activeTab === tab.id
            const href =
              tab.id === 'stammdaten' ? baseHref : `${baseHref}?tab=${tab.id}`
            return (
              <Link
                key={tab.id}
                href={href}
                className={`relative -mb-px rounded-t-gs39-sm px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'border border-b-0 border-border-1 bg-bg-1 text-fg-1'
                    : 'text-fg-3 hover:text-fg-1'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1.5 rounded-full bg-fg-1/10 px-1.5 py-0.5 text-[10px] font-bold text-fg-2">
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          })}
      </nav>

      {activeTab === 'stammdaten' && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5">
          <StationStammdatenForm slug={slug} station={station} />
        </section>
      )}

      {activeTab === 'medien' && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5">
          <StationMedienTable slug={slug} station={station} />
        </section>
      )}

      {activeTab === 'hotspots' && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 text-sm text-fg-2">
          <p className="mb-4">Hotspots-Tabelle folgt in #162.</p>
          {calib ? (
            <Link
              href={calib}
              className="font-semibold text-accent underline-offset-2 hover:underline"
            >
              {viewer === 'equirectangular'
                ? 'Kalibrieren (Hotspots + Startblick)'
                : 'Hotspot kalibrieren'}
            </Link>
          ) : (
            <p className="text-fg-3">Kein Kalibrier-Link verfügbar (Raumbild fehlt).</p>
          )}
        </section>
      )}

      {activeTab === 'dialog-audio' && hasDialog && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 text-sm text-fg-2">
          <p>Dialog-Audio-Tab folgt in #163.</p>
        </section>
      )}
    </div>
  )
}
