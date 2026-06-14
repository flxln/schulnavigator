'use client'

import { useCallback, useState } from 'react'
import type { Hotspot360 } from '@/lib/types'
import { sphereCalibFromClick } from '@/lib/raum-viewer/sphere-hotspot-calibration'

export type SphereHotspotCalibOverlayProps = {
  hotspots360?: Hotspot360[]
  lastClick: {
    yaw: number
    pitch: number
    textureX?: number
    textureY?: number
  } | null
}

export function SphereHotspotCalibOverlay({
  hotspots360,
  lastClick,
}: SphereHotspotCalibOverlayProps) {
  const [selectedId, setSelectedId] = useState<string>('')

  const snippet = lastClick
    ? sphereCalibFromClick(lastClick, selectedId || undefined)
    : null

  const copySnippet = useCallback(async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet.json)
    } catch {
      // Clipboard nicht verfügbar
    }
  }, [snippet])

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-20 max-h-[45%] overflow-y-auto rounded-[var(--r-md)] bg-black/80 p-3 text-xs text-fg-on-dark shadow-gs39-md">
      <p className="mb-2 font-semibold">Hotspot-Kalibrierung (Dev)</p>
      <p className="mb-2 text-fg-on-dark/80">
        Klicke den <strong>Ankerpunkt</strong> im Panorama (Maskottchen: Fuß,
        Medien: Icon-Mitte). yaw/pitch kommen direkt aus dem PSV-Klick.
      </p>
      {hotspots360?.length ? (
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-fg-on-dark/70">Hotspot-ID (optional)</span>
          <select
            className="rounded border border-bg-dark/40 bg-bg-dark px-2 py-1 text-fg-on-dark"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">— keine —</option>
            {hotspots360.map((hs) => (
              <option key={hs.id} value={hs.id}>
                {hs.id}
                {hs.label ? ` (${hs.label})` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {snippet ? (
        <div className="space-y-2">
          <p>
            yaw: <strong>{snippet.yawDeg}°</strong> · pitch:{' '}
            <strong>{snippet.pitchDeg}°</strong>
            {snippet.textureX !== undefined ? (
              <>
                {' '}
                · texture: {Math.round(snippet.textureX)}×
                {Math.round(snippet.textureY ?? 0)}
              </>
            ) : null}
          </p>
          <pre className="overflow-x-auto rounded bg-bg-dark/60 p-2 text-[11px]">
            {snippet.json}
          </pre>
          <button
            type="button"
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-fg-on-dark"
            onClick={() => void copySnippet()}
          >
            JSON kopieren
          </button>
        </div>
      ) : (
        <p className="text-fg-on-dark/60">Noch kein Klick auf das Panorama.</p>
      )}
    </div>
  )
}
