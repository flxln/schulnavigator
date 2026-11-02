'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import type { DesignTab } from '@/lib/mpz-studio-design-page'

export type DesignPageShellProps = {
  activeTab: DesignTab
  children: ReactNode
}

const TABS: { id: DesignTab; label: string; href: string }[] = [
  { id: 'hub', label: 'Hub-Karte', href: '/mpz/studio/design' },
  { id: 'brand', label: 'Brand & Design', href: '/mpz/studio/design?tab=brand' },
]

export function DesignPageShell({ activeTab, children }: DesignPageShellProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-4 text-2xl font-bold text-fg-1">Design & Hub</h1>

      <nav
        className="mb-6 flex flex-wrap gap-1 border-b border-border-1"
        aria-label="Design und Hub"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative -mb-px rounded-t-gs39-sm px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border border-b-0 border-border-1 bg-bg-1 text-fg-1'
                  : 'text-fg-3 hover:text-fg-1'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
