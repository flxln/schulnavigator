'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PlanABanner } from '@/components/mpz-studio/plan-a-banner'

type NavItem = {
  href: string
  label: string
  match: (path: string) => boolean
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
    href: '/mpz/studio/ingest',
    label: 'Medien hochladen',
    match: (path) => path.startsWith('/mpz/studio/ingest'),
  },
  {
    href: '/mpz/studio/dialog-audio',
    label: 'Dialog-Audio',
    match: (path) => path.startsWith('/mpz/studio/dialog-audio'),
  },
]

const DISABLED_V1 = ['Coach', 'Brand & Design', 'Hub-Karte', 'Deploy']

function pageTitle(pathname: string): string {
  if (pathname === '/mpz/studio') return 'Dashboard'
  if (pathname.startsWith('/mpz/studio/stationen')) return 'Stationen'
  if (pathname.startsWith('/mpz/studio/ingest')) return 'Medien hochladen'
  if (pathname.startsWith('/mpz/studio/dialog-audio')) return 'Dialog-Audio'
  return 'MPZ Studio'
}

export type StudioShellProps = {
  children: ReactNode
}

export function StudioShell({ children }: StudioShellProps) {
  const pathname = usePathname()
  const title = pageTitle(pathname)

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
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-gs39-sm px-3 py-2 text-sm font-medium transition-colors md:whitespace-normal ${
                  active
                    ? 'border-l-[3px] border-brand-green bg-white/10 pl-[9px] text-fg-on-dark'
                    : 'border-l-[3px] border-transparent text-white/65 hover:bg-white/5 hover:text-fg-on-dark'
                }`}
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
          <code className="text-[10px]">stations.json · Plan B v0</code>
        </div>
      </aside>

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <PlanABanner />
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-1 bg-bg-1 px-4 py-3 md:px-6">
          <h1 className="text-lg font-bold text-fg-1">{title}</h1>
          <button
            type="button"
            disabled
            title="Folgt in #150"
            className="cursor-not-allowed rounded-gs39-sm border border-border-1 bg-bg-2 px-3 py-1.5 text-sm font-semibold text-fg-3"
          >
            Speichern & Validieren
          </button>
        </header>
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  )
}
