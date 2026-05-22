'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Hotspot, Medium } from '@/lib/types'
import {
  clampPan,
  HOTSPOT_CENTER_DWELL_MS,
  HOTSPOT_DEBOUNCE_MS,
  MIN_PAN_DISPLAY_RATIO,
  PAN_SMOOTHING,
  RECOMMENDED_SOURCE_ASPECT_MIN,
  ROOM_VIEWER_HEIGHT_CSS,
  ROOM_VIEWER_MAX_HEIGHT_PX,
  maxPanPx,
} from '@/lib/raum-viewer/constants'
import { visibleYNormalRange } from '@/lib/raum-viewer/clip-zone'
import {
  gammaToTargetPan,
  lerpPan,
  neutralGammaForPan,
} from '@/lib/raum-viewer/pan-from-gamma'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
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

const NEUTRAL_CALIB_MS = 500
const RESIZE_RESET_PX = 5

export function RoomImagePane({
  src,
  alt,
  hotspots = [],
  medien,
  activeHotspotId = null,
  onHotspotTap,
  onHotspotCenterHit,
}: RoomImagePaneProps) {
  const [debugViewer, setDebugViewer] = useState(false)

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return
      setDebugViewer(
        new URLSearchParams(window.location.search).get('debug') === '1',
      )
    }
    check()
    window.addEventListener('popstate', check)
    return () => window.removeEventListener('popstate', check)
  }, [])

  const [broken, setBroken] = useState(false)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [containerW, setContainerW] = useState(0)
  const [containerH, setContainerH] = useState(ROOM_VIEWER_MAX_HEIGHT_PX)
  const [panPx, setPanPx] = useState(0)
  const [neutralEpoch, setNeutralEpoch] = useState(0)
  const [debugHud, setDebugHud] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, pan: 0 })
  const neutralGamma = useRef<number | null>(null)
  const neutralCalibrated = useRef(false)
  const neutralSamples = useRef<number[]>([])
  const panPxRef = useRef(0)
  const prevContainer = useRef({ w: 0, h: 0 })
  const centerDebounce = useRef<number | null>(null)
  const centerDwell = useRef<number | null>(null)
  const pendingCenterHit = useRef<Hotspot | null>(null)

  const {
    state: orientState,
    gamma,
    requestAccess,
  } = useDeviceOrientation(true)

  const { zoom, effectiveDisplayW, effectiveDisplayH } = useMemo(
    () =>
      roomPanZoom(
        naturalW,
        naturalH,
        containerW,
        containerH,
        MIN_PAN_DISPLAY_RATIO,
      ),
    [naturalW, naturalH, containerW, containerH],
  )

  const maxPan = useMemo(
    () => maxPanPx(effectiveDisplayW, containerW),
    [effectiveDisplayW, containerW],
  )

  useEffect(() => {
    panPxRef.current = panPx
  }, [panPx])

  useEffect(() => {
    // Pan nach maxPan-Änderung (Resize) begrenzen
    // eslint-disable-next-line react-hooks/set-state-in-effect -- maxPan kommt aus Messwerten; einmaliges Clamping
    setPanPx((p) => clampPan(p, maxPan))
  }, [maxPan])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      const pw = prevContainer.current.w
      const ph = prevContainer.current.h
      if (
        pw > 0 &&
        (Math.abs(cr.width - pw) > RESIZE_RESET_PX ||
          Math.abs(cr.height - ph) > RESIZE_RESET_PX)
      ) {
        neutralGamma.current = null
        neutralCalibrated.current = false
        neutralSamples.current = []
        setNeutralEpoch((e) => e + 1)
      }
      prevContainer.current = { w: cr.width, h: cr.height }
      setContainerW(cr.width)
      setContainerH(cr.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (orientState !== 'active') {
      neutralGamma.current = null
      neutralCalibrated.current = false
      neutralSamples.current = []
      return
    }
    neutralCalibrated.current = false
    neutralGamma.current = null
    neutralSamples.current = []
    const timer = window.setTimeout(() => {
      const arr = neutralSamples.current
      if (arr.length > 0) {
        neutralGamma.current = arr.reduce((acc, v) => acc + v, 0) / arr.length
      } else {
        neutralGamma.current = 0
      }
      neutralCalibrated.current = true
    }, NEUTRAL_CALIB_MS)
    return () => window.clearTimeout(timer)
  }, [orientState, neutralEpoch])

  useEffect(() => {
    if (orientState !== 'active' || gamma === null || Math.abs(gamma) > 90) {
      return
    }
    if (neutralCalibrated.current) {
      return
    }
    neutralSamples.current.push(gamma)
  }, [orientState, gamma])

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      effectiveDisplayW > 0 &&
      containerW > 0 &&
      zoom <= 1.001 &&
      effectiveDisplayW / containerW < MIN_PAN_DISPLAY_RATIO
    ) {
      const aspect = naturalH > 0 ? (naturalW / naturalH).toFixed(2) : '?'
      console.warn(
        `[RaumViewer] Wenig Gyro-Pan: Anzeige ${Math.round(effectiveDisplayW)}px / Viewport ${Math.round(containerW)}px (Ziel ≥${MIN_PAN_DISPLAY_RATIO}×, empfohlen Quellbild ≥${RECOMMENDED_SOURCE_ASPECT_MIN}:1, ist ${aspect}:1).`,
      )
    }
  }, [effectiveDisplayW, containerW, naturalW, naturalH, zoom])

  useEffect(() => {
    if (hotspots.length === 0 || naturalW <= 0 || naturalH <= 0) {
      return
    }
    if (containerW <= 0 || containerH <= 0) {
      return
    }
    const aspect = naturalW / naturalH
    const { yMin, yMax } = visibleYNormalRange(
      aspect,
      containerW,
      containerH,
      MIN_PAN_DISPLAY_RATIO,
    )
    for (const hs of hotspots) {
      if (hs.y < yMin || hs.y > yMax) {
        console.warn(
          `[RaumViewer] Hotspot „${hs.id}“ y=${hs.y.toFixed(3)} liegt außerhalb des sichtbaren Bereichs (${yMin.toFixed(3)}–${yMax.toFixed(3)}) bei aktuellem Zoom.`,
        )
      }
    }
  }, [hotspots, naturalW, naturalH, containerW, containerH])

  useEffect(() => {
    let running = true
    let raf = 0
    const tick = () => {
      if (!running) {
        return
      }
      if (
        !dragging.current &&
        orientState === 'active' &&
        gamma !== null &&
        neutralCalibrated.current
      ) {
        if (maxPan > 0) {
          if (neutralGamma.current === null) {
            neutralGamma.current = gamma
          }
          const target = gammaToTargetPan(gamma, maxPan, neutralGamma.current)
          setPanPx((p) => lerpPan(p, target, PAN_SMOOTHING))
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
    () => normalizedViewportCenter(panPx, containerW, effectiveDisplayW),
    [panPx, containerW, effectiveDisplayW],
  )

  useEffect(() => {
    if (!onHotspotCenterHit || hotspots.length === 0) {
      return
    }
    const hit = hitTestHotspot({ x: centerNorm.x, y: centerNorm.y }, hotspots)
    pendingCenterHit.current = hit

    if (centerDebounce.current) {
      clearTimeout(centerDebounce.current)
    }
    centerDebounce.current = window.setTimeout(() => {
      centerDebounce.current = null
      if (centerDwell.current) {
        clearTimeout(centerDwell.current)
        centerDwell.current = null
      }
      if (!hit) {
        onHotspotCenterHit(null)
        return
      }
      centerDwell.current = window.setTimeout(() => {
        centerDwell.current = null
        if (pendingCenterHit.current?.id === hit.id) {
          onHotspotCenterHit(hit)
        }
      }, HOTSPOT_CENTER_DWELL_MS)
    }, HOTSPOT_DEBOUNCE_MS)

    return () => {
      if (centerDebounce.current) {
        clearTimeout(centerDebounce.current)
      }
      if (centerDwell.current) {
        clearTimeout(centerDwell.current)
      }
    }
  }, [centerNorm, hotspots, onHotspotCenterHit])

  useEffect(() => {
    if (!debugViewer) {
      return
    }
    const id = window.setInterval(() => {
      setDebugHud(
        `${orientState} | γ:${gamma?.toFixed(1) ?? '—'} | n:${neutralGamma.current?.toFixed(1) ?? '—'} | pan:${panPxRef.current.toFixed(0)}/${maxPan.toFixed(0)} | dw:${effectiveDisplayW.toFixed(0)}/${containerW} | z:${zoom.toFixed(2)}`,
      )
    }, 100)
    return () => window.clearInterval(id)
  }, [
    debugViewer,
    orientState,
    gamma,
    maxPan,
    effectiveDisplayW,
    containerW,
    zoom,
  ])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (maxPan <= 0) return
      dragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStart.current = { x: e.clientX, pan: panPxRef.current }
    },
    [maxPan],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - dragStart.current.x
      const next = dragStart.current.pan + dx
      const clamped = clampPan(next, maxPan)
      setPanPx(clamped)
    },
    [maxPan],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      if (gamma !== null && maxPan > 0) {
        neutralGamma.current = neutralGammaForPan(
          gamma,
          panPxRef.current,
          maxPan,
        )
        neutralCalibrated.current = true
      }
    },
    [gamma, maxPan],
  )

  const recenterView = useCallback(() => {
    setPanPx(0)
    if (gamma !== null) {
      neutralGamma.current = gamma
      neutralCalibrated.current = true
    }
  }, [gamma])

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
        style={{
          height: ROOM_VIEWER_HEIGHT_CSS,
          touchAction: 'none',
          contain: 'layout paint style',
        }}
      >
        {naturalW > 0 && effectiveDisplayW > 0 ? (
          <div
            className="absolute left-0 top-1/2 will-change-transform"
            style={{
              width: effectiveDisplayW,
              height: effectiveDisplayH,
              touchAction: 'none',
              transform: `translate(${panPx}px, -50%)`,
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
            {debugViewer ? (
              <div className="pointer-events-none absolute bottom-1 right-1 max-w-[min(100%,18rem)] rounded bg-bg-dark/85 px-1.5 py-0.5 font-mono text-[10px] leading-tight text-fg-on-dark">
                {debugHud}
              </div>
            ) : null}
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
      ) : orientState === 'active' ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="Raumansicht zurücksetzen"
            className="min-h-11 min-w-11 rounded-[var(--r-md)] border border-border-2 bg-brand-sky-50 px-4 py-2 text-sm font-semibold text-fg-1 shadow-gs39-sm hover:bg-brand-sky-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            onClick={recenterView}
          >
            Ansicht zentrieren
          </button>
        </div>
      ) : (
        orientationBanner()
      )}
    </div>
  )
}
