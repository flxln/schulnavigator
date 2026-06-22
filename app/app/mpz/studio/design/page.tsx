import { BrandPanel } from '@/components/mpz-studio/brand-panel'
import { DesignPageShell } from '@/components/mpz-studio/design-page-shell'
import { HubPanel } from '@/components/mpz-studio/hub-panel'
import {
  loadBrandStudioData,
  loadHubStudioData,
  resolveDesignTab,
} from '@/lib/mpz-studio-design-page'

type PageProps = {
  searchParams: Promise<{ tab?: string | string[] }>
}

export default async function MpzStudioDesignPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = resolveDesignTab(tab)

  if (activeTab === 'brand') {
    const { slots } = await loadBrandStudioData()
    return (
      <DesignPageShell activeTab={activeTab}>
        <div className="mx-auto max-w-4xl">
          <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
            <BrandPanel initialSlots={slots} />
          </section>
        </div>
      </DesignPageShell>
    )
  }

  const { rows, assignableSlots } = await loadHubStudioData()
  return (
    <DesignPageShell activeTab={activeTab}>
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <HubPanel rows={rows} assignableSlots={assignableSlots} />
      </section>
    </DesignPageShell>
  )
}
