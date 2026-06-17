'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import type { Hotspot360 } from '@/lib/types'
import { sphereCalibFromClick } from '@/lib/raum-viewer/sphere-hotspot-calibration'

export type SphereHotspotCalibOverlayProps = {
  stationSlug: string
  hotspots360?: Hotspot360[]
  lastClick: {
    yaw: number
    pitch: number
    textureX?: number
    textureY?: number
  } | null
}

export function SphereHotspotCalibOverlay({
  stationSlug,
  hotspots360,
  lastClick,
}: SphereHotspotCalibOverlayProps) {
  const [selectedId, setSelectedId] = useState<string>(
    hotspots360?.[0]?.id ?? '',
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const snippet = lastClick
    ? sphereCalibFromClick(lastClick, selectedId || undefined)
    : null

  const copySnippet = useCallback(async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet.json)
      setMessage('JSON in Zwischenablage kopiert.')
      setError(null)
    } catch {
      setError('Zwischenablage nicht verfügbar.')
    }
  }, [snippet])

  const persistCoords = useCallback(async () => {
    if (!snippet || !selectedId) {
      setError('Hotspot-ID wählen und im Panorama klicken.')
      return
    }
    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/mpz/hotspots/sphere', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug: stationSlug,
          hotspotId: selectedId,
          yaw: snippet.yawDeg,
          pitch: snippet.pitchDeg,
        }),
      })
      const json = (await res.json()) as { message?: string }
      if (!res.ok) {
        if (res.status === 401) {
          setError('Nicht angemeldet — zuerst /mpz/unlock aufrufen.')
        } else {
          setError(json.message ?? `Fehler (${res.status})`)
        }
        return
      }
      setMessage(
        `Übernommen: ${selectedId} → yaw=${snippet.yawDeg}°, pitch=${snippet.pitchDeg}°`,
      )
    } catch {
      setError('Netzwerkfehler beim Speichern.')
    } finally {
      setBusy(false)
    }
  }, [selectedId, snippet, stationSlug])

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-20 max-h-[45%] overflow-y-auto rounded-[var(--r-md)] bg-black/80 p-3 text-xs text-fg-on-dark shadow-gs39-md">
      <p className="mb-2 font-semibold">Hotspot-Kalibrierung (Dev)</p>
      <p className="mb-2 text-fg-on-dark/80">
        Klicke den <strong>Ankerpunkt</strong> im Panorama (Maskottchen: Fuß,
        Medien: Icon-Mitte). yaw/pitch kommen direkt aus dem PSV-Klick.
      </p>
      {hotspots360?.length ? (
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-fg-on-dark/70">Hotspot-ID</span>
          <select
            className="rounded border border-bg-dark/40 bg-bg-dark px-2 py-1 text-fg-on-dark"
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
      ) : (
        <p className="mb-2 text-brand-sun">Keine hotspots360[] in stations.json.</p>
      )}
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-fg-on-dark"
              onClick={() => void copySnippet()}
            >
              JSON kopieren
            </button>
            <button
              type="button"
              disabled={busy || !selectedId || !hotspots360?.length}
              className="rounded border border-brand-green/50 bg-brand-green/20 px-3 py-1.5 text-sm font-medium text-fg-on-dark disabled:opacity-40"
              onClick={() => void persistCoords()}
            >
              {busy ? 'Speichern…' : 'In stations.json übernehmen'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-fg-on-dark/60">Noch kein Klick auf das Panorama.</p>
      )}
      {message ? <p className="mt-2 text-brand-green">{message}</p> : null}
      {error ? (
        <p className="mt-2 text-brand-red">
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
    </div>
  )
}
