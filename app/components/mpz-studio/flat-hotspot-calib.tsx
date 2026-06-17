'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Hotspot } from '@/lib/types'
import {
  flatCalibFromImageClick,
  hotspotYBandForCalib,
  objectFitContainImageRect,
  type ImageRect,
} from '@/lib/flat-hotspot-calib'
import { hotspotImageY as imageYFromViewportY } from '@/lib/raum-viewer/clip-zone'

export type FlatHotspotCalibProps = {
  slug: string
  titel: string
  bild: string
  hotspots: Hotspot[]
}

type LayoutState = {
  containerW: number
  containerH: number
  naturalW: number
  naturalH: number
  imageRect: ImageRect
  yBand: { yMin: number; yMax: number }
}

export function FlatHotspotCalib({
  slug,
  titel,
  bild,
  hotspots,
}: FlatHotspotCalibProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null)
  const [selectedId, setSelectedId] = useState(hotspots[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerSize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout: LayoutState | null =
    naturalSize.w > 0 &&
    naturalSize.h > 0 &&
    containerSize.w > 0 &&
    containerSize.h > 0
      ? (() => {
          const imageRect = objectFitContainImageRect(
            containerSize.w,
            containerSize.h,
            naturalSize.w,
            naturalSize.h,
          )
          if (!imageRect) return null
          return {
            containerW: containerSize.w,
            containerH: containerSize.h,
            naturalW: naturalSize.w,
            naturalH: naturalSize.h,
            imageRect,
            yBand: hotspotYBandForCalib(
              naturalSize.w,
              naturalSize.h,
              containerSize.w,
              containerSize.h,
            ),
          }
        })()
      : null

  const handlePanoClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (applied || !layout || !containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const imageRectViewport = {
        left: containerRect.left + layout.imageRect.left,
        top: containerRect.top + layout.imageRect.top,
        width: layout.imageRect.width,
        height: layout.imageRect.height,
      }
      const coords = flatCalibFromImageClick({
        clientX: e.clientX,
        clientY: e.clientY,
        imageRect: imageRectViewport,
        yBand: layout.yBand,
      })
      if (!coords) return
      setMarker(coords)
      setMessage(null)
      setError(null)
      setApplied(false)
    },
    [applied, layout],
  )

  const handleApply = useCallback(async () => {
    if (!marker || !selectedId) {
      setError('Hotspot wählen und Position setzen.')
      return
    }
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/mpz/hotspots/flat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          slug,
          hotspotId: selectedId,
          x: marker.x,
          y: marker.y,
        }),
      })
      const json = (await res.json()) as { message?: string }
      if (!res.ok) {
        setError(json.message ?? `Fehler (${res.status})`)
        return
      }
      setMessage(`Übernommen: ${selectedId} → x=${marker.x}, y=${marker.y}`)
      setApplied(true)
    } catch {
      setError('Netzwerkfehler — Studio-Cookie gesetzt? (/mpz/unlock)')
    } finally {
      setBusy(false)
    }
  }, [marker, selectedId, slug])

  return (
    <div className="flex min-h-[calc(100dvh-0px)] flex-col bg-[#0f1420] text-fg-on-dark">
      <div className="flex h-[50px] shrink-0 items-center gap-3 border-b border-white/10 bg-[#1a2035] px-5">
        <Link
          href="/mpz/studio"
          className="text-sm text-white/60 hover:text-white/90"
        >
          ← Zurück
        </Link>
        <span className="text-white/30">|</span>
        <span className="text-sm text-white/80">
          Flat-Kalibrierung · <span className="font-mono">{slug}</span>
        </span>
        <span className="ml-auto rounded-full border border-brand-sun/40 bg-brand-sun/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-sun">
          calib · nur lokal
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          ref={containerRef}
          className={`relative min-h-[50vh] flex-1 ${applied ? 'cursor-default' : 'cursor-crosshair'}`}
          onClick={handlePanoClick}
          role="presentation"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bild}
            alt={titel}
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget
              setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
            }}
          />

          {layout ? (
            <div
              className="pointer-events-none absolute"
              style={{
                left: layout.imageRect.left,
                top: layout.imageRect.top,
                width: layout.imageRect.width,
                height: layout.imageRect.height,
              }}
            >
              {hotspots.map((hs) => {
                const imageY = imageYFromViewportY(hs.y, layout.yBand)
                const isSelected = hs.id === selectedId
                return (
                  <div
                    key={hs.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${hs.x * 100}%`,
                      top: `${imageY * 100}%`,
                      opacity: isSelected ? 1 : 0.45,
                    }}
                  >
                    <div className="size-6 rounded-full border-2 border-brand-green/70 bg-brand-green/30" />
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px]">
                      {hs.id}
                    </span>
                  </div>
                )
              })}

              {marker ? (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${marker.x * 100}%`,
                    top: `${imageYFromViewportY(marker.y, layout.yBand) * 100}%`,
                  }}
                >
                  <div className="size-9 rounded-full border-2 border-brand-sun bg-brand-sun/25 shadow-lg" />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-white/10 bg-[#1a2035] p-5 md:w-72 md:border-l md:border-t-0">
          <div>
            <h2 className="text-sm font-semibold text-white">{titel}</h2>
            <p className="mt-1 text-xs text-white/50">
              Klick auf das Panorama setzt x/y (JSON, 0–1). y bezieht sich auf den
              sichtbaren Ausschnitt wie im Raum-Viewer.
            </p>
          </div>

          {hotspots.length === 0 ? (
            <p className="text-sm text-brand-sun">
              Keine hotspots[] — zuerst Hotspot in stations.json anlegen.
            </p>
          ) : (
            <label className="flex flex-col gap-1 text-xs text-white/70">
              Hotspot
              <select
                className="rounded border border-white/20 bg-[#0f1420] px-2 py-2 text-sm text-white"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value)
                  setApplied(false)
                }}
              >
                {hotspots.map((hs) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.id}
                    {hs.label ? ` (${hs.label})` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          {marker ? (
            <p className="font-mono text-sm text-white">
              x: <strong>{marker.x}</strong>
              <br />
              y: <strong>{marker.y}</strong>
            </p>
          ) : (
            <p className="text-sm text-white/40">Noch kein Klick auf das Bild.</p>
          )}

          <button
            type="button"
            disabled={busy || !marker || !selectedId || hotspots.length === 0}
            className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark disabled:opacity-40"
            onClick={() => void handleApply()}
          >
            {busy ? 'Speichern…' : 'In stations.json übernehmen'}
          </button>

          {message ? (
            <p className="text-sm text-brand-green">{message}</p>
          ) : null}
          {error ? <p className="text-sm text-brand-red">{error}</p> : null}
        </aside>
      </div>
    </div>
  )
}
