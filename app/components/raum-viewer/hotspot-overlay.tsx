'use client'

import type { Hotspot, Medium } from '@/lib/types'

const TYP_LABEL: Record<Medium['typ'], string> = {
  audio: 'Audio',
  video: 'Video',
  foto: 'Foto',
  text: 'Text',
}

export type HotspotOverlayProps = {
  hotspots: Hotspot[]
  medien: Medium[]
  onHotspotTap?: (hotspot: Hotspot) => void
}

function hotspotAriaLabel(hs: Hotspot, medien: Medium[]): string {
  const m = medien.find((x) => x.id === hs.mediumId)
  const typ = m ? TYP_LABEL[m.typ] : 'Medium'
  const label = hs.label?.trim()
  if (label) {
    return `${label}, verknüpft mit ${typ}`
  }
  return `Hotspot, verknüpft mit ${typ}`
}

export function HotspotOverlay({
  hotspots,
  medien,
  onHotspotTap,
}: HotspotOverlayProps) {
  if (hotspots.length === 0) {
    return null
  }

  return (
    <ul className="pointer-events-none absolute inset-0 m-0 list-none p-0">
      {hotspots.map((hs) => {
        const label = hotspotAriaLabel(hs, medien)
        const interactive = typeof onHotspotTap === 'function'
        const style = {
          left: `${hs.x * 100}%`,
          top: `${hs.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        } as const
        const className =
          'pointer-events-auto absolute h-4 w-4 rounded-full border-2 border-white bg-amber-500 shadow-md ring-2 ring-zinc-900/30'

        if (interactive) {
          return (
            <li key={hs.id} style={style}>
              <button
                type="button"
                className={className}
                aria-label={label}
                onClick={() => onHotspotTap(hs)}
              />
            </li>
          )
        }

        return (
          <li key={hs.id} style={style}>
            <span
              role="img"
              aria-label={label}
              tabIndex={-1}
              className={className}
            />
          </li>
        )
      })}
    </ul>
  )
}
