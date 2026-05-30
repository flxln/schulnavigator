import type { Metadata } from 'next'
import {
  EintrittScreen,
  eintrittVariantFromReason,
} from '@/components/eintritt/eintritt-screen'

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

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 overflow-x-hidden px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <EintrittScreen variant={variant} />
    </main>
  )
}
