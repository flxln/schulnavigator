import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { ScanScreen } from '@/components/scan/scan-screen'
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
    <main className="mx-auto min-h-[100dvh] max-w-lg overflow-x-hidden">
      <ScanScreen slugs={slugs} origin={origin} />
    </main>
  )
}
