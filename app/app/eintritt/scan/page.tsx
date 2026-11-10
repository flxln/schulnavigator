import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { EintrittScanScreen } from '@/components/eintritt/eintritt-scan-screen'
import { instanceCopy } from '@/lib/instance-profile'
import { getTrustedScanOrigins } from '@/lib/scan-trusted-origins'

export const metadata: Metadata = {
  title: 'Eintritts-QR scannen — Schulnavigator',
  description: instanceCopy.eintrittScanDescription,
}

export default async function EintrittScanPage() {
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = host ? `${proto}://${host}` : 'http://localhost:3000'
  const trustedOrigins = getTrustedScanOrigins()

  return (
    <main className="w-full max-w-none overflow-x-hidden">
      <EintrittScanScreen origin={origin} trustedOrigins={trustedOrigins} />
    </main>
  )
}
