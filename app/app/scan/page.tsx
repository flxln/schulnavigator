import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'QR-Scanner — Schulnavigator',
  description:
    'Der In-App-QR-Scanner für Raum-Codes wird in Phase 2 bereitgestellt.',
}

export default function ScanPlaceholderPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav aria-label="Navigation">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          Zur Startseite
        </Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-zinc-900">
          QR-Code scannen
        </h1>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Der In-App-Scanner für Raum-QR-Codes kommt in Phase 2 (Issue #23). Bis
          dahin kannst du Raum-QR-Codes mit der Kamera-App deines Geräts
          scannen, wenn du die App bereits über den Eintritts-Link geöffnet
          hast.
        </p>
      </header>
    </main>
  )
}
