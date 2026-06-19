import { BrandPanel } from '@/components/mpz-studio/brand-panel'
import { listBrandManifest } from '@/lib/mpz-brand-ingest'

export default async function MpzStudioBrandPage() {
  const { slots } = await listBrandManifest()

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <BrandPanel initialSlots={slots} />
      </section>
    </div>
  )
}
