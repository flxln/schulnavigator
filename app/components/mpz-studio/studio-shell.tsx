'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { PlanABanner } from '@/components/mpz-studio/plan-a-banner'
import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { SaveValidatePanel } from '@/components/mpz-studio/save-validate-panel'
import { useStudioValidation } from '@/components/mpz-studio/studio-validation-context'

import type {
  MpzStationOverview,
  MpzValidationReport,
  StationHealth,
} from '@/lib/mpz-studio-overview'

type GlobalNavItem = { href: string; label: string }

const GLOBALER_INHALT_ITEMS: GlobalNavItem[] = [
  { href: '/mpz/studio/coach', label: 'Coach' },
  { href: '/mpz/studio/embeds', label: 'Embeds & Links' },
]

const ERSCHEINUNGSBILD_ITEMS: GlobalNavItem[] = [
  { href: '/mpz/studio/design', label: 'Design & Hub' },
]

const BETRIEB_ITEMS: GlobalNavItem[] = [
  { href: '/mpz/studio/deploy', label: 'Deploy' },
]

const STATION_DETAIL_PATH_RE = /^\/mpz\/studio\/stationen\/([^/]+)$/

function healthDotClass(health: StationHealth): string {
  if (health === 'ok') return 'bg-accent'
  if (health === 'warn') return 'bg-warn'
  return 'bg-error'
}

function healthLabel(health: StationHealth): string {
  if (health === 'ok') return 'Bereit'
  if (health === 'warn') return 'Warnung'
  return 'Fehler'
}

type Crumb = { group?: string; title: string }

function breadcrumb(
  pathname: string,
  report: MpzValidationReport | null,
): Crumb {
  const detailMatch = STATION_DETAIL_PATH_RE.exec(pathname)
  if (detailMatch) {
    const slug = detailMatch[1] ?? ''
    const summary = report?.stationSummaries.find((s) => s.slug === slug)
    return { group: 'Stationen', title: summary?.titel ?? slug }
  }
  if (pathname === '/mpz/studio') return { title: 'Dashboard' }
  if (pathname.startsWith('/mpz/studio/stationen')) return { title: 'Stationen' }
  if (pathname.startsWith('/mpz/studio/coach')) return { title: 'Coach' }
  if (pathname.startsWith('/mpz/studio/embeds'))
    return { title: 'Embeds & Links' }
  if (pathname.startsWith('/mpz/studio/design')) return { title: 'Design & Hub' }
  if (pathname.startsWith('/mpz/studio/deploy')) return { title: 'Deploy' }
  return { title: 'MPZ Studio' }
}

export type StudioShellProps = {
  children: ReactNode
}

export function StudioShell({ children }: StudioShellProps) {
  const pathname = usePathname()
  const {
    dirty,
    loading,
    report,
    error,
    saveFeedback,
    saveAndValidate,
    clearSaveFeedback,
  } = useStudioValidation()

  const [navOpen, setNavOpen] = useState(false)
  const crumb = breadcrumb(pathname, report)
  const closeNav = () => setNavOpen(false)

  // Close the mobile drawer on Escape. Navigation closes it via link handlers.
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  const summaries = report?.stationSummaries ?? []
  const buttonDisabled = loading || !dirty

  return (
    <div className="relative flex min-h-screen w-full">
      {navOpen && (
        <button
          type="button"
          aria-label="Navigation schließen"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-brand-navy-300/40 md:hidden"
        />
      )}

      <aside
        id="studio-nav"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-bg-dark text-fg-on-dark transition-transform duration-200 ease-out motion-reduce:transition-none md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-base font-black tracking-tight">MPZ Studio</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-sun/40 bg-brand-sun/15 px-2.5 py-0.5 text-[11px] font-semibold text-brand-sun">
              <span className="size-1.5 rounded-full bg-brand-sun" aria-hidden />
              Nur lokal · development
            </span>
          </div>
          <button
            type="button"
            aria-label="Navigation schließen"
            onClick={() => setNavOpen(false)}
            className="-mr-1 grid size-11 shrink-0 place-items-center rounded-gs39-sm text-white/70 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav
          aria-label="Studio-Navigation"
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3"
        >
          <GroupLabel>
            <span>Übersicht</span>
          </GroupLabel>
          <NavLink
            href="/mpz/studio"
            label="Dashboard"
            active={pathname === '/mpz/studio'}
            onNavigate={closeNav}
          />

          <GroupLabel>
            <span>Stationen</span>
            <ReadinessCount summaries={summaries} />
          </GroupLabel>
          <NavLink
            href="/mpz/studio/stationen"
            label="Alle Stationen"
            active={pathname === '/mpz/studio/stationen'}
            onNavigate={closeNav}
          />
          <RoomRoster
            summaries={summaries}
            pathname={pathname}
            loading={loading && summaries.length === 0}
            locked={!!error && !report}
            onNavigate={closeNav}
          />

          <GroupLabel>
            <span>Globaler Inhalt</span>
          </GroupLabel>
          {GLOBALER_INHALT_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname.startsWith(item.href)}
              onNavigate={closeNav}
            />
          ))}

          <GroupLabel>
            <span>Erscheinungsbild</span>
          </GroupLabel>
          {ERSCHEINUNGSBILD_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname.startsWith(item.href)}
              onNavigate={closeNav}
            />
          ))}

          <GroupLabel>
            <span>Betrieb</span>
          </GroupLabel>
          {BETRIEB_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname.startsWith(item.href)}
              onNavigate={closeNav}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-3 text-[11px] text-white/35">
          39. Grundschule Dresden
          <br />
          <code className="text-[10px]">stations.json → git → Coolify</code>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PlanABanner />
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-border-1 bg-bg-1/95 px-4 py-3 backdrop-blur md:px-6">
          <button
            type="button"
            aria-label="Navigation öffnen"
            aria-expanded={navOpen}
            aria-controls="studio-nav"
            onClick={() => setNavOpen(true)}
            className="grid size-11 shrink-0 place-items-center rounded-gs39-sm border border-border-1 text-fg-1 hover:bg-bg-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <nav aria-label="Brotkrumen" className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-fg-1">
              {crumb.group && (
                <span className="font-medium text-fg-3">{crumb.group} / </span>
              )}
              {crumb.title}
            </p>
          </nav>

          <ReadinessMeter summaries={summaries} loading={loading} locked={!!error && !report} />

          <SaveControl
            dirty={dirty}
            loading={loading}
            disabled={buttonDisabled}
            onClick={() => void saveAndValidate()}
          />
        </header>

        {error && (
          <div className="border-b border-border-1 px-4 py-2 md:px-6">
            <MpzFormAlert variant="error">{error}</MpzFormAlert>
          </div>
        )}

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

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex items-center justify-between gap-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
      {children}
    </p>
  )
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string
  label: string
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-11 items-center rounded-gs39-sm border-l-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        active
          ? 'border-white bg-white/10 text-white'
          : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}

function ReadinessCount({
  summaries,
}: {
  summaries: MpzStationOverview[]
}) {
  if (summaries.length === 0) return null
  const green = summaries.filter((s) => s.health === 'ok').length
  return (
    <span className="font-semibold tabular-nums text-white/45">
      {green}/{summaries.length}
    </span>
  )
}

function RoomRoster({
  summaries,
  pathname,
  loading,
  locked,
  onNavigate,
}: {
  summaries: MpzStationOverview[]
  pathname: string
  loading: boolean
  locked: boolean
  onNavigate?: () => void
}) {
  if (locked) {
    return (
      <Link
        href="/mpz/unlock"
        onClick={onNavigate}
        className="mx-1 mt-1 block rounded-gs39-sm px-3 py-2 text-xs font-semibold text-brand-sun underline-offset-2 hover:underline"
      >
        Gesperrt — entsperren
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="mt-1 flex flex-col gap-1 px-1" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 animate-pulse rounded-gs39-sm bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <ul className="mt-0.5">
      {summaries.map((st) => {
        const active = pathname === `/mpz/studio/stationen/${st.slug}`
        return (
          <li key={st.slug}>
            <Link
              href={`/mpz/studio/stationen/${st.slug}`}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[40px] items-center gap-2.5 rounded-gs39-sm border-l-2 px-3 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                active
                  ? 'border-white bg-white/10 text-white'
                  : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span
                className={`w-5 shrink-0 text-right font-black tabular-nums ${
                  active ? 'text-white/80' : 'text-white/35'
                }`}
              >
                {String(st.hubNr).padStart(2, '0')}
              </span>
              <span
                className={`size-1.5 shrink-0 rounded-full ${healthDotClass(st.health)}`}
                title={healthLabel(st.health)}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{st.titel}</span>
              <span className="sr-only">— {healthLabel(st.health)}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function ReadinessMeter({
  summaries,
  loading,
  locked,
}: {
  summaries: MpzStationOverview[]
  loading: boolean
  locked: boolean
}) {
  if (locked) {
    return (
      <Link
        href="/mpz/unlock"
        className="inline-flex items-center gap-1.5 rounded-gs39-sm border border-warn/50 bg-warn/15 px-2.5 py-1 text-xs font-semibold text-fg-1 hover:bg-warn/25"
      >
        <span className="size-1.5 rounded-full bg-warn" aria-hidden />
        Gesperrt
      </Link>
    )
  }

  const total = summaries.length || 12
  const green = summaries.filter((s) => s.health === 'ok').length
  const warn = summaries.filter((s) => s.health === 'warn').length
  const errors = summaries.filter((s) => s.health === 'error').length

  const ticks: StationHealth[] =
    summaries.length > 0
      ? summaries.map((s) => s.health)
      : Array.from({ length: 12 }, () => 'ok')

  const label =
    summaries.length === 0
      ? 'Stationen werden geprüft'
      : `${green} von ${total} Stationen bereit` +
        (warn ? `, ${warn} Warnungen` : '') +
        (errors ? `, ${errors} Fehler` : '')

  return (
    <div
      className="hidden items-center gap-2.5 rounded-gs39-sm border border-border-1 bg-bg-2 px-3 py-1 sm:flex"
      title={label}
    >
      <span className="sr-only">{label}</span>
      <span className="flex items-baseline gap-0.5" aria-hidden>
        <span className="text-xl font-black leading-none tabular-nums text-fg-1">
          {summaries.length === 0 ? '–' : green}
        </span>
        <span className="text-xs font-semibold text-fg-3">/{total}</span>
      </span>
      <div className="hidden gap-px md:flex" aria-hidden>
        {ticks.map((h, i) => (
          <span
            key={i}
            className={`h-3.5 w-1 rounded-full ${
              summaries.length === 0 ? 'bg-border-2' : healthDotClass(h)
            } ${loading ? 'opacity-50' : ''}`}
          />
        ))}
      </div>
      {(warn > 0 || errors > 0) && (
        <span className="flex items-center gap-2 text-xs font-semibold text-fg-2" aria-hidden>
          {warn > 0 && (
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-warn" />
              {warn}
            </span>
          )}
          {errors > 0 && (
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-error" />
              {errors}
            </span>
          )}
        </span>
      )}
    </div>
  )
}

function SaveControl({
  dirty,
  loading,
  disabled,
  onClick,
}: {
  dirty: boolean
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <div className="flex items-center gap-2.5">
      {dirty && !loading && (
        <>
          <span
            className="size-1.5 shrink-0 rounded-full bg-warn sm:hidden"
            title="Ungespeichert"
            aria-hidden
          />
          <span className="hidden items-center gap-1.5 text-xs font-semibold text-fg-3 sm:flex">
            <span className="size-1.5 rounded-full bg-warn" aria-hidden />
            Ungespeichert
          </span>
        </>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        title={disabled && !loading ? 'Keine ausstehenden Änderungen' : undefined}
        className={`inline-flex min-h-11 items-center rounded-gs39-sm px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          disabled
            ? 'cursor-not-allowed border border-border-1 bg-bg-2 text-fg-3'
            : 'border border-accent bg-accent text-fg-on-dark hover:bg-accent-hover'
        }`}
      >
        {loading ? 'Prüft Struktur und Dateien…' : 'Speichern & Validieren'}
      </button>
    </div>
  )
}
