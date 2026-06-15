export type QrPrintItem = {
  id: string
  label: string
  subtitle: string
  url: string
  kind: 'entry' | 'room'
}

export interface QrManifestEntry {
  file: string
  url: string
  token: string
  mode: 'fest' | 'heft'
}

export interface QrManifestRoom {
  file: string
  url: string
  slug: string
  titel: string
}

export interface QrManifestShape {
  entries: QrManifestEntry[]
  rooms: QrManifestRoom[]
}

const ENTRY_SUBTITLES: Record<'fest' | 'heft', string> = {
  fest: 'Eintritt Schulfest',
  heft: 'Eintritt Schulheft',
}

export function toPrintItems(manifest: QrManifestShape): QrPrintItem[] {
  const items: QrPrintItem[] = []

  for (const entry of manifest.entries) {
    const label = entry.file.replace(/\.png$/i, '')
    items.push({
      id: label,
      label,
      subtitle: ENTRY_SUBTITLES[entry.mode],
      url: entry.url,
      kind: 'entry',
    })
  }

  const rooms = [...manifest.rooms].sort((a, b) =>
    a.slug.localeCompare(b.slug, 'de'),
  )
  for (const room of rooms) {
    items.push({
      id: room.slug,
      label: room.slug,
      subtitle: room.titel,
      url: room.url,
      kind: 'room',
    })
  }

  return items
}

export function qrWidthPxForMm(qrSizeMm: number, dpi = 300): number {
  return Math.max(512, Math.round((qrSizeMm / 25.4) * dpi))
}
