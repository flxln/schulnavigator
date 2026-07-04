'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

type LegalPageShellProps = {
  title: string
  children: ReactNode
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-fg-2 transition hover:bg-bg-3 hover:text-fg-1"
          aria-label="Zurück"
        >
          <ChevronLeft size={22} aria-hidden />
        </button>
        <h1 className="text-xl font-extrabold text-fg-1">{title}</h1>
      </div>

      {children}

      <p className="border-t border-border-1 pt-4 text-center text-xs text-fg-3">
        <Link href="/impressum" className="underline underline-offset-2">
          Impressum
        </Link>
        <span aria-hidden className="mx-2">
          ·
        </span>
        <Link href="/datenschutz" className="underline underline-offset-2">
          Datenschutz
        </Link>
      </p>
    </div>
  )
}
