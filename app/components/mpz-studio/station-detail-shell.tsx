'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MpzCard } from '@/components/mpz-studio/mpz-card'
import {
  mpzStackClassName,
  mpzTabLinkClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import {
  healthDotClass,
  healthLabel,
} from '@/components/mpz-studio/mpz-studio-health'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'
import { StationStammdatenForm } from '@/components/mpz-studio/station-stammdaten-form'
import { StationHotspotsTable } from '@/components/mpz-studio/station-hotspots-table'
import { StationDialogPanel } from '@/components/mpz-studio/station-dialog-panel'
import { StationMedienTable } from '@/components/mpz-studio/station-medien-table'
import type { StationHealth } from '@/lib/mpz-studio-overview'
import type { Station, ViewerMode } from '@/lib/types'

const VALID_TABS = ['stammdaten', 'medien', 'hotspots', 'dialog'] as const
type DetailTab = (typeof VALID_TABS)[number]

export type StationDetailShellProps = {
  station: Station | null
  slug: string
  hubNr: number
  globalSuffixes: readonly string[]
}

function viewerLabel(viewer: ViewerMode): string {
  return viewer === 'equirectangular' ? '360°' : 'flat'
}

function resolveTab(raw: string | null): DetailTab {
  if (raw === 'dialog-audio') return 'dialog'
  if (raw && VALID_TABS.includes(raw as DetailTab)) {
    return raw as DetailTab
  }
  return 'stammdaten'
}

function issuesStatusLine(
  health: StationHealth,
  issues: string[],
): { text: string; className: string } | null {
  if (health === 'error' && issues.length === 0) {
    return {
      text: 'Validierungsstatus nicht verfügbar',
      className: 'text-sm font-semibold text-fg-3',
    }
  }
  if (health === 'error' && issues.length > 0) {
    return {
      text: 'Prüfung fehlgeschlagen',
      className: 'text-sm font-semibold text-error',
    }
  }
  if (health === 'warn' && issues.length > 0) {
    return {
      text: 'Bitte prüfen',
      className: 'text-sm font-semibold text-warn',
    }
  }
  return null
}

export function StationDetailShell({
  station,
  slug,
  hubNr,
  globalSuffixes,
}: StationDetailShellProps) {
  const searchParams = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))
  const { report } = useStudioValidation()

  const summary = report?.stationSummaries.find((s) => s.slug === slug)
  const titel = station?.titel ?? summary?.titel ?? slug
  const viewer = station?.viewer ?? summary?.viewer ?? 'flat'
  const health = summary?.health ?? (station ? 'ok' : 'error')
  const issues = summary?.issues ?? []
  const medienCount = station?.medien?.length ?? summary?.medienCount ?? 0
  const hotspotCount =
    (station?.hotspots?.length ?? 0) + (station?.hotspots360?.length ?? 0) ||
    summary?.hotspotCount ||
    0

  const tabs: { id: DetailTab; label: string; badge?: number }[] = [
    { id: 'stammdaten', label: 'Stammdaten' },
    { id: 'medien', label: 'Medien', badge: medienCount },
    { id: 'hotspots', label: 'Hotspots', badge: hotspotCount || undefined },
    { id: 'dialog', label: 'Dialog' },
  ]

  const baseHref = `/mpz/studio/stationen/${encodeURIComponent(slug)}`
  const statusLine = issuesStatusLine(health, issues)
  const showIssuesBlock =
    issues.length > 0 || (health === 'error' && issues.length === 0)

  return (
    <div className={`mx-auto max-w-7xl ${mpzStackClassName('lg')}`}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-fg-1">{titel}</h1>
            <span className="rounded bg-bg-1 px-2 py-0.5 text-xs font-semibold text-fg-3">
              Hub {hubNr}
            </span>
            <span className="rounded bg-bg-1 px-2 py-0.5 text-xs font-semibold text-fg-3">
              {viewerLabel(viewer)}
            </span>
            <span
              className={`size-3 rounded-full ${healthDotClass(health)}`}
              title={healthLabel(health)}
              aria-hidden
            />
            <span className="sr-only">— {healthLabel(health)}</span>
          </div>

          {showIssuesBlock && statusLine && (
            <div>
              <p className={statusLine.className}>{statusLine.text}</p>
              {issues.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs text-fg-3">
                  {issues.map((issue) => (
                    <li key={issue}>— {issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/raum/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ↗ Vorschau /raum/{slug}
        </Link>
      </header>

      <nav
        className="flex flex-wrap gap-8 border-b border-border-1"
        aria-label="Station bearbeiten"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          const href =
            tab.id === 'stammdaten' ? baseHref : `${baseHref}?tab=${tab.id}`
          return (
            <Link
              key={tab.id}
              href={href}
              className={mpzTabLinkClassName({ active })}
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
        <MpzCard>
          <StationStammdatenForm slug={slug} station={station} />
        </MpzCard>
      )}

      {activeTab === 'medien' && (
        <MpzCard>
          <StationMedienTable slug={slug} station={station} globalSuffixes={globalSuffixes} />
        </MpzCard>
      )}

      {activeTab === 'hotspots' && (
        <MpzCard>
          <StationHotspotsTable slug={slug} station={station} />
        </MpzCard>
      )}

      {activeTab === 'dialog' && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5">
          <StationDialogPanel slug={slug} station={station} />
        </section>
      )}
    </div>
  )
}
