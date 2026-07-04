import { BrandPanel } from '@/components/mpz-studio/brand-panel'
import { DesignPageShell } from '@/components/mpz-studio/design-page-shell'
import { HubPanel } from '@/components/mpz-studio/hub-panel'
import { MpzCard } from '@/components/mpz-studio/mpz-card'
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
        <div className="mx-auto w-full max-w-4xl">
          <MpzCard>
            <BrandPanel initialSlots={slots} />
          </MpzCard>
        </div>
      </DesignPageShell>
    )
  }

  const { rows, assignableSlots } = await loadHubStudioData()
  return (
    <DesignPageShell activeTab={activeTab}>
      <MpzCard>
        <HubPanel rows={rows} assignableSlots={assignableSlots} />
      </MpzCard>
    </DesignPageShell>
  )
}
