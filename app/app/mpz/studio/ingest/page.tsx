import { redirect } from 'next/navigation'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'

type PageProps = {
  searchParams: Promise<{ slug?: string }>
}

export default async function MpzStudioIngestPage({ searchParams }: PageProps) {
  const params = await searchParams
  const slug = params.slug

  if (slug && isHubSlug(slug)) {
    redirect(
      `/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=medien`,
    )
  }

  redirect('/mpz/studio/stationen')
}
