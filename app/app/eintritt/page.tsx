import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Eintritt — Schulnavigator',
  description:
    'Zugang zur App über Einladungslink (Tag der offenen Tür, 39. Grundschule Dresden).',
}

type PageProps = {
  searchParams: Promise<{ t?: string }>
}

export default async function EintrittPage({ searchParams }: PageProps) {
  const { t } = await searchParams

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
        <h1 className="text-2xl font-semibold text-zinc-900">Eintritt</h1>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Der Zugang über diesen Link wird zum Schulfest freigeschaltet. Bis
          dahin kannst du die Stationen testen, indem du die Startseite öffnest
          und eine Station auswählst — oder du scannst einen Raum-QR mit der
          Kamera-App deines Geräts.
        </p>
        {process.env.NODE_ENV === 'development' && t ? (
          <p className="mt-4 text-xs text-zinc-500">
            Entwicklung: Parameter t={t}
          </p>
        ) : null}
      </header>
    </main>
  )
}
