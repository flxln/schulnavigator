import type { Metadata } from 'next'
import { datenschutzContent } from '@/content/legal/datenschutz'
import { demoDatenschutzContent } from '@/content/legal/demo-datenschutz'
import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { LegalSections } from '@/components/legal/legal-sections'
import { IS_DEMO_INSTANCE, instanceCopy } from '@/lib/instance-profile'

const content = IS_DEMO_INSTANCE ? demoDatenschutzContent : datenschutzContent

export const metadata: Metadata = {
  title: 'Datenschutz — Schulnavigator',
  description: instanceCopy.datenschutzDescription,
  robots: { index: false, follow: false },
}

export default function DatenschutzPage() {
  return (
    <main className="sn-page-container flex min-h-full flex-col overflow-x-hidden px-4 py-8 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      <LegalPageShell title={content.title}>
        <LegalSections content={content} />
      </LegalPageShell>
    </main>
  )
}
