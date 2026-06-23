'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Hotspot360 } from '@/lib/types'
import { sphereCalibFromClick } from '@/lib/raum-viewer/sphere-hotspot-calibration'
import {
  persistSphereHotspot,
  persistSphereStartView,
} from '@/lib/mpz-sphere-calib-persist'
import { markMpzStudioDirty } from '@/components/mpz-studio/studio-validation-context'

const CALIB_VIEW_POLL_MS = 200

type CalibView = { yawDeg: number; pitchDeg: number }

function CalibViewReadout({
  getCurrentView,
  onViewChange,
}: {
  getCurrentView: () => CalibView | null
  onViewChange?: (view: CalibView | null) => void
}) {
  const [view, setView] = useState<CalibView | null>(null)

  useEffect(() => {
    const tick = () => {
      const next = getCurrentView()
      setView(next)
      onViewChange?.(next)
    }
    tick()
    const id = window.setInterval(tick, CALIB_VIEW_POLL_MS)
    return () => window.clearInterval(id)
  }, [getCurrentView, onViewChange])

  if (!view) {
    return (
      <p className="text-fg-on-dark/60">
        Panorama drehen, um die Kameraposition zu erfassen.
      </p>
    )
  }

  return (
    <p>
      yaw: <strong>{view.yawDeg}°</strong> · pitch:{' '}
      <strong>{view.pitchDeg}°</strong>
    </p>
  )
}

export type SphereHotspotCalibOverlayProps = {
  stationSlug: string
  hotspots360?: Hotspot360[]
  lastClick: {
    yaw: number
    pitch: number
    textureX?: number
    textureY?: number
  } | null
  getCurrentView: () => CalibView | null
  savedStartView?: { startYaw: number; startPitch: number }
}

export function SphereHotspotCalibOverlay({
  stationSlug,
  hotspots360,
  lastClick,
  getCurrentView,
  savedStartView,
}: SphereHotspotCalibOverlayProps) {
  const [selectedId, setSelectedId] = useState<string>(
    hotspots360?.[0]?.id ?? '',
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startBusy, setStartBusy] = useState(false)
  const [startMessage, setStartMessage] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [hasCalibView, setHasCalibView] = useState(false)

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
      const result = await persistSphereHotspot({
        slug: stationSlug,
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
  }, [selectedId, snippet, stationSlug])

  const persistStartView = useCallback(async () => {
    const view = getCurrentView()
    if (!view) {
      setStartError('Panorama drehen, um eine Kameraposition zu erfassen.')
      return
    }
    setStartBusy(true)
    setStartMessage(null)
    setStartError(null)
    try {
      const result = await persistSphereStartView({
        slug: stationSlug,
        startYaw: view.yawDeg,
        startPitch: view.pitchDeg,
      })
      if (!result.ok) {
        setStartError(result.message)
        return
      }
      markMpzStudioDirty()
      setStartMessage(result.message)
    } finally {
      setStartBusy(false)
    }
  }, [getCurrentView, stationSlug])

  const handleCalibViewChange = useCallback((view: CalibView | null) => {
    setHasCalibView(view !== null)
  }, [])

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-20 max-h-[55%] overflow-y-auto rounded-[var(--r-md)] bg-black/80 p-3 text-xs text-fg-on-dark shadow-gs39-md">
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

      <hr className="my-3 border-fg-on-dark/20" />

      <p className="mb-2 font-semibold">Startblick (Dev)</p>
      <p className="mb-2 text-fg-on-dark/80">
        Drehe das Panorama zur gewünschten <strong>Einstiegsansicht</strong>.
        Das ist nicht derselbe Wert wie ein Hotspot-Klick.
      </p>
      {savedStartView ? (
        <p className="mb-2 text-fg-on-dark/70">
          Gespeichert: yaw={savedStartView.startYaw}°, pitch=
          {savedStartView.startPitch}°
        </p>
      ) : (
        <p className="mb-2 text-fg-on-dark/60">Noch kein Startblick in stations.json.</p>
      )}
      <CalibViewReadout
        getCurrentView={getCurrentView}
        onViewChange={handleCalibViewChange}
      />
      <div className="mt-2">
        <button
          type="button"
          disabled={startBusy || !hasCalibView}
          className="rounded border border-brand-green/50 bg-brand-green/20 px-3 py-1.5 text-sm font-medium text-fg-on-dark disabled:opacity-40"
          onClick={() => void persistStartView()}
        >
          {startBusy ? 'Speichern…' : 'Als Startblick übernehmen'}
        </button>
      </div>
      {startMessage ? <p className="mt-2 text-brand-green">{startMessage}</p> : null}
      {startError ? (
        <p className="mt-2 text-brand-red">
          {startError}
          {startError.includes('/mpz/unlock') ? (
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
