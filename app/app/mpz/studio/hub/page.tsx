import { HubPanel, type AssignableSlotInfo, type HubStationRow } from '@/components/mpz-studio/hub-panel'
import { HUB_SLOTS } from '@/lib/hub-slot-definitions'
import { createMpzContentIo } from '@/lib/mpz-content-io'
import { listAssignableSlotIds } from '@/lib/mpz-hub-config-validation'

export default async function MpzStudioHubPage() {
  const io = createMpzContentIo()
  const [hubConfig, stationsFile] = await Promise.all([
    io.readHubConfig(),
    io.readStations(),
  ])

  const titleBySlug = new Map(stationsFile.stations.map((s) => [s.slug, s.titel]))

  const rows: HubStationRow[] = Object.entries(hubConfig.slugMap.mappings)
    .map(([slug, mapping]) => ({
      slug,
      titel: titleBySlug.get(slug) ?? slug,
      nr: mapping.nr,
      slotId: mapping.slotId,
      accent: hubConfig.accents.accents[slug] ?? '#000000',
      iconName: hubConfig.icons.icons[slug]?.name ?? 'GraduationCap',
    }))
    .sort((a, b) => a.nr - b.nr)

  const assignableSlots: AssignableSlotInfo[] = listAssignableSlotIds().map((id) => {
    const slot = HUB_SLOTS[id]!
    return {
      id,
      kind: slot.kind,
      frame: slot.frame,
      hitFrame: slot.hitFrame ?? slot.frame,
      rotation: slot.rotation,
    }
  })

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <HubPanel rows={rows} assignableSlots={assignableSlots} />
      </section>
    </div>
  )
}
