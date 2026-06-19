'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMediaIngest } from '@/components/mpz-studio/media-ingest-modal-context'
import { PlanABanner } from '@/components/mpz-studio/plan-a-banner'
import { SaveValidatePanel } from '@/components/mpz-studio/save-validate-panel'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'

import type { MpzValidationReport } from '@/lib/mpz-studio-overview'

type NavItem = {
  href?: string
  label: string
  match: (path: string) => boolean
  action?: 'openMediaIngest'
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/mpz/studio',
    label: 'Dashboard',
    match: (path) => path === '/mpz/studio',
  },
  {
    href: '/mpz/studio/stationen',
    label: 'Stationen',
    match: (path) => path.startsWith('/mpz/studio/stationen'),
  },
  {
    action: 'openMediaIngest',
    label: 'Medien hochladen',
    match: (path) => path.startsWith('/mpz/studio/ingest'),
  },
  {
    href: '/mpz/studio/dialog-audio',
    label: 'Dialog-Audio',
    match: (path) => path.startsWith('/mpz/studio/dialog-audio'),
  },
  {
    href: '/mpz/studio/coach',
    label: 'Coach',
    match: (path) => path.startsWith('/mpz/studio/coach'),
  },
  {
    href: '/mpz/studio/embeds',
    label: 'Embeds & Links',
    match: (path) => path.startsWith('/mpz/studio/embeds'),
  },
  {
    href: '/mpz/studio/hub',
    label: 'Hub-Karte',
    match: (path) => path.startsWith('/mpz/studio/hub'),
  },
  {
    href: '/mpz/studio/brand',
    label: 'Brand & Design',
    match: (path) => path.startsWith('/mpz/studio/brand'),
  },
  {
    href: '/mpz/studio/deploy',
    label: 'Deploy',
    match: (path) => path.startsWith('/mpz/studio/deploy'),
  },
]

const DISABLED_V1: string[] = []

const STATION_DETAIL_PATH_RE = /^\/mpz\/studio\/stationen\/([^/]+)$/

function pageTitle(
  pathname: string,
  report: MpzValidationReport | null,
): string {
  const detailMatch = STATION_DETAIL_PATH_RE.exec(pathname)
  if (detailMatch) {
    const slug = detailMatch[1] ?? ''
    const summary = report?.stationSummaries.find((s) => s.slug === slug)
    return summary?.titel ?? (slug || 'Stationen')
  }
  if (pathname === '/mpz/studio') return 'Dashboard'
  if (pathname.startsWith('/mpz/studio/stationen')) return 'Stationen'
  if (pathname.startsWith('/mpz/studio/ingest')) return 'Medien hochladen'
  if (pathname.startsWith('/mpz/studio/dialog-audio')) return 'Dialog-Audio'
  if (pathname.startsWith('/mpz/studio/coach')) return 'Coach'
  if (pathname.startsWith('/mpz/studio/embeds')) return 'Embeds & Links'
  if (pathname.startsWith('/mpz/studio/hub')) return 'Hub-Karte'
  if (pathname.startsWith('/mpz/studio/brand')) return 'Brand & Design'
  if (pathname.startsWith('/mpz/studio/deploy')) return 'Deploy'
  return 'MPZ Studio'
}

export type StudioShellProps = {
  children: ReactNode
}

export function StudioShell({ children }: StudioShellProps) {
  const pathname = usePathname()
  const { openMediaIngest } = useMediaIngest()
  const {
    dirty,
    loading,
    report,
    saveFeedback,
    saveAndValidate,
    clearSaveFeedback,
  } = useStudioValidation()
  const title = pageTitle(pathname, report)

  const buttonDisabled = loading || (!dirty && report?.ok === true)

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-bg-dark text-fg-on-dark md:w-60">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-base font-bold tracking-tight">MPZ Studio</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-sun/40 bg-brand-sun/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-sun">
            <span className="size-1.5 rounded-full bg-brand-sun" aria-hidden />
            Nur lokal · development
          </span>
        </div>

        <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-2 py-3 md:flex-col md:overflow-x-visible">
          {NAV_ITEMS.map((item) => {
            const active = item.match(pathname)
            const className = `whitespace-nowrap rounded-gs39-sm px-3 py-2 text-sm font-medium transition-colors md:whitespace-normal ${
              active
                ? 'border-l-[3px] border-brand-green bg-white/10 pl-[9px] text-fg-on-dark'
                : 'border-l-[3px] border-transparent text-white/65 hover:bg-white/5 hover:text-fg-on-dark'
            }`

            if (item.action === 'openMediaIngest') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => openMediaIngest()}
                  className={`${className} w-full text-left`}
                >
                  {item.label}
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={className}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="mx-2 my-2 hidden h-px bg-white/10 md:block" />
          <p className="hidden px-3 text-[10px] font-bold uppercase tracking-wider text-white/25 md:block">
            v1 / v2
          </p>
          {DISABLED_V1.map((label) => (
            <span
              key={label}
              className="hidden cursor-not-allowed px-3 py-1.5 text-sm text-white/25 md:block"
            >
              {label}
            </span>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 px-4 py-3 text-[11px] text-white/35 md:block">
          39. Grundschule Dresden
          <br />
          <code className="text-[10px]">stations.json · v1</code>
        </div>
      </aside>

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <PlanABanner />
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-1 bg-bg-1 px-4 py-3 md:px-6">
          <h1 className="text-lg font-bold text-fg-1">{title}</h1>
          <button
            type="button"
            disabled={buttonDisabled}
            onClick={() => void saveAndValidate()}
            title={
              buttonDisabled && !loading
                ? 'Keine ausstehenden Änderungen'
                : undefined
            }
            className={`rounded-gs39-sm px-3 py-1.5 text-sm font-semibold transition-colors ${
              buttonDisabled
                ? 'cursor-not-allowed border border-border-1 bg-bg-2 text-fg-3'
                : 'border border-brand-green bg-brand-green text-fg-on-dark hover:opacity-90'
            }`}
          >
            {loading ? 'Prüfe Struktur und Dateien…' : 'Speichern & Validieren'}
          </button>
        </header>
        {saveFeedback && (
          <SaveValidatePanel
            feedback={saveFeedback}
            onDismiss={clearSaveFeedback}
          />
        )}
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  )
}
