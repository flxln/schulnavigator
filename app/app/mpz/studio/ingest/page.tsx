import { MediaIngestForm } from '@/components/mpz-studio/media-ingest-form'

type PageProps = {
  searchParams: Promise<{ slug?: string }>
}

export default async function MpzStudioIngestPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialSlug = params.slug ?? undefined

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-6 text-sm text-fg-2">
        Medien-Datei-Ingest (#147). Datei und Metadaten werden in{' '}
        <code className="text-fg-1">public/media/</code> und{' '}
        <code className="text-fg-1">stations.json</code> geschrieben.
      </p>
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <MediaIngestForm initialSlug={initialSlug} />
      </section>
    </div>
  )
}
