import type { AssignableSlotInfo, HubStationRow } from '@/components/mpz-studio/hub-panel'
import { HUB_SLOTS } from '@/lib/hub-slot-definitions'
import { createMpzContentIo } from '@/lib/mpz-content-io'
import { listAssignableSlotIds } from '@/lib/mpz-hub-config-validation'
import { listBrandManifest, type BrandSlotManifest } from '@/lib/mpz-brand-ingest'

export type DesignTab = 'hub' | 'brand'

export function resolveDesignTab(raw: string | string[] | undefined): DesignTab {
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === 'brand' ? 'brand' : 'hub'
}

export type HubStudioData = {
  rows: HubStationRow[]
  assignableSlots: AssignableSlotInfo[]
}

export async function loadHubStudioData(): Promise<HubStudioData> {
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

  return { rows, assignableSlots }
}

export type BrandStudioData = {
  slots: readonly BrandSlotManifest[]
}

export async function loadBrandStudioData(): Promise<BrandStudioData> {
  const { slots } = await listBrandManifest()
  return { slots }
}
