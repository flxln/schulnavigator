import { HUB_SLOTS, listAssignableSlotIds } from '@/lib/hub-slot-definitions'
import { isLucideIconName } from '@/lib/lucide-icon-registry'

export { listAssignableSlotIds }

export type HubSlugMapping = {
  slotId: string
  nr: number
}

export type HubSlugMapFile = {
  mappings: Record<string, HubSlugMapping>
}

export type StationAccentsFile = {
  accents: Record<string, string>
}

export type StationIconJson = {
  type: 'lucide'
  name: string
}

export type StationIconsFile = {
  icons: Record<string, StationIconJson>
}

export type HubConfigBundle = {
  slugMap: HubSlugMapFile
  accents: StationAccentsFile
  icons: StationIconsFile
}

export const ACCENT_HEX_RE = /^#[0-9a-f]{6}$/i

export function isValidAccentHex(raw: string): boolean {
  return ACCENT_HEX_RE.test(raw.trim())
}

function isAssignableSlotId(slotId: string): boolean {
  const slot = HUB_SLOTS[slotId]
  return slot !== undefined && slot.kind !== 'deko'
}

export function validateHubSlugMapContent(
  raw: unknown,
  options?: { expectedSlugs?: ReadonlySet<string> },
): string[] {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    errors.push('hub-slug-map.json: Root muss ein Objekt sein')
    return errors
  }

  const file = raw as HubSlugMapFile
  if (typeof file.mappings !== 'object' || file.mappings === null || Array.isArray(file.mappings)) {
    errors.push('hub-slug-map.json: mappings muss ein Objekt sein')
    return errors
  }

  const entries = Object.entries(file.mappings)
  if (entries.length !== 12) {
    errors.push(`hub-slug-map.json: erwartet 12 Einträge, erhalten ${entries.length}`)
  }

  const slotIds = new Set<string>()
  const nrs = new Set<number>()

  for (const [slug, mapping] of entries) {
    const ctx = `hub-slug-map.json: mappings["${slug}"]`

    if (options?.expectedSlugs && !options.expectedSlugs.has(slug)) {
      errors.push(`${ctx}: unbekannter slug (nicht in stations.json)`)
    }

    if (typeof mapping !== 'object' || mapping === null) {
      errors.push(`${ctx}: kein Objekt`)
      continue
    }

    if (typeof mapping.slotId !== 'string' || mapping.slotId.length === 0) {
      errors.push(`${ctx}: slotId fehlt`)
    } else if (!(mapping.slotId in HUB_SLOTS)) {
      errors.push(`${ctx}: slotId "${mapping.slotId}" existiert nicht in HUB_SLOTS`)
    } else if (!isAssignableSlotId(mapping.slotId)) {
      errors.push(`${ctx}: slotId "${mapping.slotId}" ist nicht zuweisbar (kind deko)`)
    } else if (slotIds.has(mapping.slotId)) {
      errors.push(`${ctx}: doppelter slotId "${mapping.slotId}"`)
    } else {
      slotIds.add(mapping.slotId)
    }

    if (typeof mapping.nr !== 'number' || !Number.isInteger(mapping.nr)) {
      errors.push(`${ctx}: nr muss eine ganze Zahl sein`)
    } else if (mapping.nr < 1 || mapping.nr > 12) {
      errors.push(`${ctx}: nr muss zwischen 1 und 12 liegen`)
    } else if (nrs.has(mapping.nr)) {
      errors.push(`${ctx}: doppelte nr ${mapping.nr}`)
    } else {
      nrs.add(mapping.nr)
    }
  }

  if (options?.expectedSlugs) {
    for (const slug of options.expectedSlugs) {
      if (!(slug in file.mappings)) {
        errors.push(`hub-slug-map.json: fehlender slug "${slug}"`)
      }
    }
  }

  return errors
}

export function validateStationAccentsContent(
  raw: unknown,
  options?: { expectedSlugs?: ReadonlySet<string> },
): string[] {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    errors.push('station-accents.json: Root muss ein Objekt sein')
    return errors
  }

  const file = raw as StationAccentsFile
  if (typeof file.accents !== 'object' || file.accents === null || Array.isArray(file.accents)) {
    errors.push('station-accents.json: accents muss ein Objekt sein')
    return errors
  }

  for (const [slug, hex] of Object.entries(file.accents)) {
    const ctx = `station-accents.json: accents["${slug}"]`

    if (options?.expectedSlugs && !options.expectedSlugs.has(slug)) {
      errors.push(`${ctx}: unbekannter slug (nicht in stations.json)`)
    }

    if (typeof hex !== 'string') {
      errors.push(`${ctx}: muss ein String sein`)
      continue
    }

    if (!isValidAccentHex(hex)) {
      errors.push(`${ctx}: "${hex}" ist kein gültiges Hex (#RRGGBB)`)
    }
  }

  if (options?.expectedSlugs) {
    for (const slug of options.expectedSlugs) {
      if (!(slug in file.accents)) {
        errors.push(`station-accents.json: fehlender Akzent für slug "${slug}"`)
      }
    }
  }

  return errors
}

export function validateStationIconsContent(
  raw: unknown,
  options?: { expectedSlugs?: ReadonlySet<string> },
): string[] {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    errors.push('station-icons.json: Root muss ein Objekt sein')
    return errors
  }

  const file = raw as StationIconsFile
  if (typeof file.icons !== 'object' || file.icons === null || Array.isArray(file.icons)) {
    errors.push('station-icons.json: icons muss ein Objekt sein')
    return errors
  }

  for (const [slug, icon] of Object.entries(file.icons)) {
    const ctx = `station-icons.json: icons["${slug}"]`

    if (options?.expectedSlugs && !options.expectedSlugs.has(slug)) {
      errors.push(`${ctx}: unbekannter slug (nicht in stations.json)`)
    }

    if (typeof icon !== 'object' || icon === null) {
      errors.push(`${ctx}: kein Objekt`)
      continue
    }

    if (icon.type !== 'lucide') {
      errors.push(`${ctx}: type muss "lucide" sein`)
      continue
    }

    if (typeof icon.name !== 'string' || icon.name.length === 0) {
      errors.push(`${ctx}: name fehlt`)
    } else if (!isLucideIconName(icon.name)) {
      errors.push(`${ctx}: unbekannter Lucide-Name "${icon.name}"`)
    }
  }

  if (options?.expectedSlugs) {
    for (const slug of options.expectedSlugs) {
      if (!(slug in file.icons)) {
        errors.push(`station-icons.json: fehlendes Icon für slug "${slug}"`)
      }
    }
  }

  return errors
}
