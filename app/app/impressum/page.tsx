import type { Metadata } from 'next'
import { impressumContent } from '@/content/legal/impressum'
import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { LegalSections } from '@/components/legal/legal-sections'

export const metadata: Metadata = {
  title: 'Impressum — Schulnavigator',
  description: 'Impressum des Schulnavigators der 39. Grundschule Dresden.',
  robots: { index: false, follow: false },
}

export default function ImpressumPage() {
  return (
    <main className="sn-page-container flex min-h-full flex-col overflow-x-hidden px-4 py-8 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      <LegalPageShell title={impressumContent.title}>
        <LegalSections content={impressumContent} />
      </LegalPageShell>
    </main>
  )
}
