'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HIDDEN_PREFIXES = ['/impressum', '/datenschutz', '/mpz'] as const

const DARK_TONE_PREFIXES = ['/scan', '/eintritt/scan'] as const

function shouldHideFooter(pathname: string): boolean {
  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isDarkTone(pathname: string): boolean {
  return DARK_TONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function LegalFooter() {
  const pathname = usePathname() ?? ''

  if (shouldHideFooter(pathname)) {
    return null
  }

  const dark = isDarkTone(pathname)
  const linkClass = dark
    ? 'text-white/70 underline underline-offset-2 hover:text-white'
    : 'text-fg-3 underline underline-offset-2 hover:text-fg-1'
  const barClass = dark
    ? 'bg-black/40 backdrop-blur-sm'
    : 'bg-bg-1/90 backdrop-blur-sm'

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-40 ${barClass}`}
      aria-label="Rechtliche Hinweise"
    >
      <nav
        className="flex min-h-11 items-center justify-center gap-3 px-4 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 text-[0.65rem] font-medium tracking-wide"
        aria-label="Impressum und Datenschutz"
      >
        <Link href="/impressum" className={linkClass}>
          Impressum
        </Link>
        <span aria-hidden className={dark ? 'text-white/40' : 'text-fg-3/50'}>
          ·
        </span>
        <Link href="/datenschutz" className={linkClass}>
          Datenschutz
        </Link>
      </nav>
    </footer>
  )
}
