import type { Metadata } from 'next'
import {
  EintrittScreen,
  eintrittVariantFromReason,
} from '@/components/eintritt/eintritt-screen'
import { instanceCopy } from '@/lib/instance-profile'

export const metadata: Metadata = {
  title: 'Eintritt — Schulnavigator',
  description: instanceCopy.eintrittDescription,
}

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function EintrittPage({ searchParams }: PageProps) {
  const { reason } = await searchParams
  const variant = eintrittVariantFromReason(reason)

  return (
    <main className="sn-page-container flex min-h-full flex-col gap-6 overflow-x-hidden px-4 py-8 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <EintrittScreen variant={variant} />
    </main>
  )
}
