import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { QrScanner } from '@/components/scan/qr-scanner'
import { getAllStations } from '@/lib/stations'

export const metadata: Metadata = {
  title: 'QR-Scanner — Schulnavigator',
  description: 'Raum-QR-Codes im Schulnavigator scannen.',
}

export default async function ScanPage() {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = host ? `${proto}://${host}` : 'http://localhost:3000'

  const slugs = getAllStations().map((s) => s.slug)

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav aria-label="Navigation">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center text-sm font-medium text-accent-alt underline-offset-4 hover:text-fg-1 hover:underline"
        >
          Zur Startseite
        </Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-fg-1">QR-Code scannen</h1>
        <p className="mt-4 text-sm leading-relaxed text-fg-2">
          Halte den QR-Code an der Raumtür in den Rahmen. Es werden nur Codes
          für Stationen dieser Schule akzeptiert.
        </p>
      </header>
      <QrScanner slugs={slugs} origin={origin} />
    </main>
  )
}
