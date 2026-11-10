import type { Metadata } from 'next'
import { demoImpressumContent } from '@/content/legal/demo-impressum'
import { impressumContent } from '@/content/legal/impressum'
import { LegalPageShell } from '@/components/legal/legal-page-shell'
import { LegalSections } from '@/components/legal/legal-sections'
import { IS_DEMO_INSTANCE, instanceCopy } from '@/lib/instance-profile'

const content = IS_DEMO_INSTANCE ? demoImpressumContent : impressumContent

export const metadata: Metadata = {
  title: 'Impressum — Schulnavigator',
  description: instanceCopy.impressumDescription,
  robots: { index: false, follow: false },
}

export default function ImpressumPage() {
  return (
    <main className="sn-page-container flex min-h-full flex-col overflow-x-hidden px-4 py-8 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
      <LegalPageShell title={content.title}>
        <LegalSections content={content} />
      </LegalPageShell>
    </main>
  )
}
