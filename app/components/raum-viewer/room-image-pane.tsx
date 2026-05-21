'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Hotspot, Medium } from '@/lib/types'
import {
  HOTSPOT_DEBOUNCE_MS,
  MIN_PAN_DISPLAY_RATIO,
  PAN_SMOOTHING,
  RECOMMENDED_SOURCE_ASPECT_MIN,
  ROOM_VIEWER_HEIGHT_CSS,
  ROOM_VIEWER_MAX_HEIGHT_PX,
  imageDisplayWidth,
  maxPanPx,
} from '@/lib/raum-viewer/constants'
import { gammaToTargetPan, lerpPan } from '@/lib/raum-viewer/pan-from-gamma'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import { HotspotOverlay } from '@/components/raum-viewer/hotspot-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'

export type RoomImagePaneProps = {
  src: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  activeHotspotId?: string | null
  onHotspotTap?: (hotspot: Hotspot) => void
  onHotspotCenterHit?: (hotspot: Hotspot | null) => void
}

export function RoomImagePane({
  src,
  alt,
  hotspots = [],
  medien,
  activeHotspotId = null,
  onHotspotTap,
  onHotspotCenterHit,
}: RoomImagePaneProps) {
  const [broken, setBroken] = useState(false)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [containerW, setContainerW] = useState(0)
  const [containerH, setContainerH] = useState(ROOM_VIEWER_MAX_HEIGHT_PX)
  const [panPx, setPanPx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, pan: 0 })
  const neutralGamma = useRef<number | null>(null)
  const centerDebounce = useRef<number | null>(null)

  const {
    state: orientState,
    gamma,
    requestAccess,
  } = useDeviceOrientation(true)

  const displayW = useMemo(
    () => imageDisplayWidth(naturalW, naturalH, containerH),
    [naturalW, naturalH, containerH],
  )

  const maxPan = useMemo(
    () => maxPanPx(displayW, containerW),
    [displayW, containerW],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      setContainerW(cr.width)
      setContainerH(cr.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      displayW > 0 &&
      containerW > 0 &&
      displayW / containerW < MIN_PAN_DISPLAY_RATIO
    ) {
      const aspect =
        naturalH > 0 ? (naturalW / naturalH).toFixed(2) : '?'
      console.warn(
        `[RaumViewer] Wenig Gyro-Pan: Anzeige ${Math.round(displayW)}px / Viewport ${Math.round(containerW)}px (Ziel ≥${MIN_PAN_DISPLAY_RATIO}×, empfohlen Quellbild ≥${RECOMMENDED_SOURCE_ASPECT_MIN}:1, ist ${aspect}:1).`,
      )
    }
  }, [displayW, containerW, naturalW, naturalH])

  useEffect(() => {
    let running = true
    let raf = 0
    const tick = () => {
      if (!running) {
        return
      }
      if (!dragging.current && orientState === 'active' && gamma !== null) {
        if (maxPan > 0) {
          if (neutralGamma.current === null) {
            neutralGamma.current = gamma
          }
          const target = gammaToTargetPan(gamma, maxPan, neutralGamma.current)
          setPanPx((p) => {
            const n = lerpPan(p, target, PAN_SMOOTHING)
            return Math.abs(n - p) < 0.02 ? p : n
          })
        }
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [orientState, gamma, maxPan])

  const centerNorm = useMemo(
    () => normalizedViewportCenter(panPx, containerW, displayW),
    [panPx, containerW, displayW],
  )

  useEffect(() => {
    if (!onHotspotCenterHit || hotspots.length === 0) {
      return
    }
    const hit = hitTestHotspot({ x: centerNorm.x, y: centerNorm.y }, hotspots)
    if (centerDebounce.current) {
      clearTimeout(centerDebounce.current)
    }
    centerDebounce.current = window.setTimeout(() => {
      onHotspotCenterHit(hit)
    }, HOTSPOT_DEBOUNCE_MS)
    return () => {
      if (centerDebounce.current) {
        clearTimeout(centerDebounce.current)
      }
    }
  }, [centerNorm, hotspots, onHotspotCenterHit])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (maxPan <= 0) return
      dragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStart.current = { x: e.clientX, pan: panPx }
    },
    [maxPan, panPx],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - dragStart.current.x
      const next = dragStart.current.pan + dx
      const clamped = Math.min(0, Math.max(-maxPan, next))
      setPanPx(clamped)
    },
    [maxPan],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  const orientationBanner = () => {
    if (orientState === 'active' || orientState === 'needs-gesture') {
      return null
    }
    const text =
      orientState === 'denied'
        ? 'Orientierung abgelehnt — Hotspots per Tippen öffnen oder wischen.'
        : 'Orientierung nicht verfügbar — Hotspots per Tippen öffnen oder wischen.'
    return (
      <p className="rounded-[var(--r-sm)] bg-brand-sky-50 px-2 py-1.5 text-center text-xs text-fg-2">
        {text}
      </p>
    )
  }

  if (broken) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-[var(--r-md)] bg-brand-sky-50 px-4 text-center text-sm font-medium text-fg-1"
        style={{ height: ROOM_VIEWER_HEIGHT_CSS }}
      >
        Raumbild konnte nicht geladen werden.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-[var(--r-md)] bg-bg-dark"
        style={{ height: ROOM_VIEWER_HEIGHT_CSS }}
      >
        {naturalW > 0 && displayW > 0 ? (
          <div
            className="relative h-full will-change-transform"
            style={{
              width: displayW,
              transform: `translateX(${panPx}px)`,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <Image
              src={src}
              alt={alt}
              fill
              priority
              sizes="100vw"
              className="object-contain object-left"
              draggable={false}
              onLoadingComplete={(img) => {
                setNaturalW(img.naturalWidth)
                setNaturalH(img.naturalHeight)
              }}
              onError={() => setBroken(true)}
            />
            <HotspotOverlay
              hotspots={hotspots}
              medien={medien}
              activeHotspotId={activeHotspotId}
              onHotspotTap={onHotspotTap}
            />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onLoadingComplete={(img) => {
              setNaturalW(img.naturalWidth)
              setNaturalH(img.naturalHeight)
            }}
            onError={() => setBroken(true)}
          />
        )}
      </div>
      {orientState === 'needs-gesture' ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-fg-2">
            Für die Raum-Bewegung bitte Orientierung erlauben (einmalig).
          </p>
          <button
            type="button"
            className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark shadow-gs39-sm hover:bg-accent-hover"
            onClick={() => void requestAccess()}
          >
            Orientierung aktivieren
          </button>
        </div>
      ) : (
        orientationBanner()
      )}
    </div>
  )
}
