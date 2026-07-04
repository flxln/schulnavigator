'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  mpzStackClassName,
  mpzTabLinkClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
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
    <div className={`mx-auto max-w-6xl ${mpzStackClassName('lg')}`}>
      <h1 className="text-2xl font-semibold text-fg-1">Design & Hub</h1>

      <nav
        className="flex flex-wrap gap-8 border-b border-border-1"
        aria-label="Design und Hub"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={mpzTabLinkClassName({ active })}
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
