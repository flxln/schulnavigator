import { MpzStudioIngestOpener } from '@/components/mpz-studio/mpz-studio-ingest-opener'

type PageProps = {
  searchParams: Promise<{ slug?: string }>
}

export default async function MpzStudioIngestPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialSlug = params.slug ?? undefined

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-6 text-sm text-fg-2">
        Medien-Ingest (#147, #172). Dateien und externe Medien (link/embed) werden in{' '}
        <code className="text-fg-1">public/media/</code> bzw.{' '}
        <code className="text-fg-1">stations.json</code> geschrieben.
      </p>
      <MpzStudioIngestOpener slug={initialSlug} />
    </div>
  )
}
