import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { QrScanner } from '@/components/scan/qr-scanner'

export const metadata: Metadata = {
  title: 'Eintritt — Schulnavigator',
  description:
    'Zugang zur App über Einladungslink (Tag der offenen Tür, 39. Grundschule Dresden).',
}

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

function hintMessage(reason: string | undefined): string {
  if (reason === 'invalid') {
    return 'Dieser Zugangslink ist ungültig — bitte den aktuellen QR-Code am Eingang scannen.'
  }
  if (reason === 'expired') {
    return 'Dein Zugang ist abgelaufen — bitte den aktuellen QR-Code am Eingang oder im Schulstartheft scannen.'
  }
  return 'Bitte scanne den QR-Code am Eingang oder im Schulstartheft, um die App zu öffnen.'
}

export default async function EintrittPage({ searchParams }: PageProps) {
  const { reason } = await searchParams
  const message = hintMessage(reason)

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = host ? `${proto}://${host}` : 'http://localhost:3000'

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header>
        <h1 className="text-2xl font-semibold text-fg-1" tabIndex={-1}>
          Eintritt
        </h1>
        <p
          className="mt-4 text-fg-2 leading-relaxed"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </header>
      <section aria-labelledby="eintritt-scan-heading">
        <h2 id="eintritt-scan-heading" className="sr-only">
          Eintritts-QR scannen
        </h2>
        <p className="mb-4 text-sm text-fg-2">
          Oder scanne den Code direkt hier in der App:
        </p>
        <QrScanner mode="entry" origin={origin} />
      </section>
    </main>
  )
}
