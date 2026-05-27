import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { QrScanner } from '@/components/scan/qr-scanner'
import {
  EintrittScreen,
  eintrittVariantFromReason,
} from '@/components/eintritt/eintritt-screen'
import { getTrustedScanOrigins } from '@/lib/scan-trusted-origins'

export const metadata: Metadata = {
  title: 'Eintritt — Schulnavigator',
  description:
    'Zugang zur App über Einladungslink (Tag der offenen Tür, 39. Grundschule Dresden).',
}

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function EintrittPage({ searchParams }: PageProps) {
  const { reason } = await searchParams
  const variant = eintrittVariantFromReason(reason)
  const isFresh = variant === 'fresh'

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = host ? `${proto}://${host}` : 'http://localhost:3000'
  const trustedOrigins = getTrustedScanOrigins()

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 overflow-x-hidden px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <EintrittScreen variant={variant} />
      {isFresh ? (
        <section
          className="relative z-[1]"
          aria-labelledby="eintritt-scan-heading"
        >
          <h2 id="eintritt-scan-heading" className="sr-only">
            Eintritts-QR scannen
          </h2>
          <QrScanner mode="entry" origin={origin} trustedOrigins={trustedOrigins} />
        </section>
      ) : null}
    </main>
  )
}
