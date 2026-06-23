'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { markMpzStudioDirty } from '@/components/mpz-studio/studio-validation-context'
import type { SphereCalibClick } from '@/components/raum-viewer/sphere-raum-viewer-inner'
import { persistSphereHotspot } from '@/lib/mpz-sphere-calib-persist'
import { sphereCalibFromClick } from '@/lib/raum-viewer/sphere-hotspot-calibration'
import type { Hotspot360 } from '@/lib/types'

export type SphereHotspotCalibProps = {
  slug: string
  titel: string
  hotspots360: Hotspot360[]
  calibClick: SphereCalibClick | null
}

export function SphereHotspotCalib({
  slug,
  titel,
  hotspots360,
  calibClick,
}: SphereHotspotCalibProps) {
  const [selectedId, setSelectedId] = useState(hotspots360[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const snippet = calibClick
    ? sphereCalibFromClick(calibClick, selectedId || undefined)
    : null

  const handleApply = useCallback(async () => {
    if (!snippet || !selectedId) {
      setError('Hotspot wählen und im Panorama klicken.')
      return
    }
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const result = await persistSphereHotspot({
        slug,
        hotspotId: selectedId,
        yaw: snippet.yawDeg,
        pitch: snippet.pitchDeg,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      markMpzStudioDirty()
      setMessage(result.message)
    } finally {
      setBusy(false)
    }
  }, [selectedId, snippet, slug])

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-white/10 bg-[#1a2035] p-5 md:w-80 md:border-l md:border-t-0">
      <div>
        <h2 className="text-sm font-semibold text-white">{titel}</h2>
        <p className="mt-1 text-xs text-white/50">
          Klicke den <strong>Ankerpunkt</strong> im Panorama (Maskottchen: Fuß,
          Medien: Icon-Mitte). yaw/pitch kommen direkt aus dem PSV-Klick.
        </p>
      </div>

      {hotspots360.length === 0 ? (
        <p className="text-sm text-brand-sun">
          Keine hotspots360[] — zuerst Hotspot in stations.json anlegen.
        </p>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-white/70">
          Hotspot
          <select
            className="rounded border border-white/20 bg-[#0f1420] px-2 py-1.5 text-sm text-white"
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value)
              setMessage(null)
              setError(null)
            }}
          >
            {hotspots360.map((hs) => (
              <option key={hs.id} value={hs.id}>
                {hs.id}
                {hs.label ? ` (${hs.label})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      {snippet ? (
        <p className="font-mono text-sm text-white">
          yaw: <strong>{snippet.yawDeg}°</strong> · pitch:{' '}
          <strong>{snippet.pitchDeg}°</strong>
        </p>
      ) : (
        <p className="text-sm text-white/40">Noch kein Klick auf das Panorama.</p>
      )}

      <button
        type="button"
        disabled={busy || !snippet || !selectedId || hotspots360.length === 0}
        className="rounded-[var(--r-md)] border border-brand-green/50 bg-brand-green/20 px-4 py-2 text-sm font-semibold text-fg-on-dark disabled:opacity-40"
        onClick={() => void handleApply()}
      >
        {busy ? 'Speichern…' : 'In stations.json übernehmen'}
      </button>

      {message ? <p className="text-sm text-brand-green">{message}</p> : null}
      {error ? (
        <p className="text-sm text-brand-red">
          {error}
          {error.includes('/mpz/unlock') ? (
            <>
              {' '}
              <Link href="/mpz/unlock" className="underline">
                Entsperren
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </aside>
  )
}
