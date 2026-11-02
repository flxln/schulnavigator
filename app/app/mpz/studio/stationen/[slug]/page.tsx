import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { StationDetailShell } from '@/components/mpz-studio/station-detail-shell'
import { createMpzContentIo, MpzContentIoError } from '@/lib/mpz-content-io'
import { getEmbedAllowSuffixes } from '@/lib/embed-allowlist'
import { getHubSlugMap, isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { Station } from '@/lib/types'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function MpzStationDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  if (!isHubSlug(slug)) {
    notFound()
  }

  const { tab } = await searchParams
  if (tab === 'dialog-audio') {
    redirect(
      `/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=dialog`,
    )
  }

  const hubNr = getHubSlugMap()[slug]!.nr
  let station: Station | null = null

  try {
    const data = await createMpzContentIo().readStations()
    station = data.stations.find((s) => s.slug === slug) ?? null
  } catch (err) {
    if (!(err instanceof MpzContentIoError)) {
      throw err
    }
  }

  return (
    <Suspense fallback={<p className="text-sm text-fg-2">Laden…</p>}>
      <StationDetailShell
        station={station}
        slug={slug}
        hubNr={hubNr}
        globalSuffixes={getEmbedAllowSuffixes()}
      />
    </Suspense>
  )
}
