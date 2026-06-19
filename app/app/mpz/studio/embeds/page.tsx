import { EmbedsPanel, type LinkEmbedMediumRow } from '@/components/mpz-studio/embeds-panel'
import { createMpzContentIo } from '@/lib/mpz-content-io'

export default async function MpzStudioEmbedsPage() {
  const io = createMpzContentIo()
  const [allowlist, stationsFile] = await Promise.all([
    io.readEmbedAllowlist(),
    io.readStations(),
  ])

  const mediaRows: LinkEmbedMediumRow[] = []
  for (const station of stationsFile.stations) {
    for (const medium of station.medien ?? []) {
      if (medium.typ !== 'link' && medium.typ !== 'embed') {
        continue
      }
      mediaRows.push({
        slug: station.slug,
        stationTitle: station.titel,
        mediumId: medium.id,
        typ: medium.typ,
        quelle: medium.quelle,
        embedAllow: medium.embedAllow,
        openIn: medium.openIn,
      })
    }
  }

  mediaRows.sort((a, b) => {
    const bySlug = a.slug.localeCompare(b.slug)
    if (bySlug !== 0) return bySlug
    return a.mediumId.localeCompare(b.mediumId)
  })

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <EmbedsPanel suffixes={allowlist.suffixes} mediaRows={mediaRows} />
      </section>
    </div>
  )
}
