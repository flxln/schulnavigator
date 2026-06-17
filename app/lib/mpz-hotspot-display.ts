import type { Hotspot, Hotspot360, HotspotBase } from '@/lib/types'

export type HotspotRowLink =
  | { kind: 'medium'; mediumId: string }
  | { kind: 'dialog'; mascot: string }

export function formatHotspotCoordsFlat(h: Hotspot): string {
  return `${h.x.toFixed(4)}, ${h.y.toFixed(4)}`
}

export function formatHotspotCoordsSphere(h: Hotspot360): string {
  return `${h.yaw}°, ${h.pitch}°`
}

export function resolveHotspotRowLink(h: HotspotBase): HotspotRowLink | null {
  if (h.action === 'dialog') {
    if (!h.mascot) return null
    return { kind: 'dialog', mascot: h.mascot }
  }
  if (!h.mediumId) return null
  return { kind: 'medium', mediumId: h.mediumId }
}

export function formatHotspotRowLink(h: HotspotBase): string {
  const link = resolveHotspotRowLink(h)
  if (!link) return '—'
  if (link.kind === 'dialog') {
    return `Maskottchen: ${link.mascot}`
  }
  return link.mediumId
}
