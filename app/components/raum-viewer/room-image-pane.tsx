'use client'

import Image from 'next/image'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { DialogRolle, Hotspot, Medium } from '@/lib/types'
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
  centeredPanPx,
  lerpPan,
  neutralAngleForPan,
  orientationToTargetPan,
  panMappingForAxis,
} from '@/lib/raum-viewer/pan-from-orientation'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
import { isMascotDialogHotspot } from '@/lib/dialog-hotspot'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import { HotspotOverlay } from '@/components/raum-viewer/hotspot-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'
import type { RaumViewerLayout } from '@/components/raum-viewer/raum-viewer'

export type RoomImagePaneProps = {
  src: string
  alt: string
  hotspots?: Hotspot[]
  medien: Medium[]
  activeHotspotId?: string | null
  speakingRolle?: DialogRolle | null
  onHotspotTap?: (hotspot: Hotspot) => void
  onHotspotCenterHit?: (hotspot: Hotspot | null) => void
  layout?: RaumViewerLayout
  orientationEnabled?: boolean
}

export type RoomImagePaneHandle = {
  recenterView: () => void
}

const NEUTRAL_CALIB_MS = 500
const RESIZE_RESET_PX = 5
const GAMMA_SAMPLE_MAX_ABS = 90

export const RoomImagePane = forwardRef<RoomImagePaneHandle, RoomImagePaneProps>(
  function RoomImagePane(
    {
      src,
      alt,
      hotspots = [],
      medien,
      activeHotspotId = null,
      speakingRolle = null,
      onHotspotTap,
      onHotspotCenterHit,
      layout = 'default',
      orientationEnabled = true,
    },
    ref,
  ) {
  const isHero = layout === 'hero'
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
  const neutralAngle = useRef<number | null>(null)
  const neutralCalibrated = useRef(false)
  const neutralSamples = useRef<number[]>([])
  const panPxRef = useRef(0)
  const prevContainer = useRef({ w: 0, h: 0 })
  const centerDebounce = useRef<number | null>(null)
  const centerDwell = useRef<number | null>(null)
  const pendingCenterHit = useRef<Hotspot | null>(null)
  const panAxisRef = useRef<'alpha' | 'gamma'>('alpha')

  const {
    state: orientState,
    alpha,
    gamma,
    panAngle,
    panAxis,
    axisEpoch,
    requestAccess,
  } = useDeviceOrientation(orientationEnabled)

  const panMode = panMappingForAxis(panAxis)
  // alpha ist jetzt ein kontinuierlicher (entfalteter) Heading → einfache
  // Differenz statt 0/360-Faltung; gamma war schon linear.
  const useCircularDelta = false
  const angle = panAngle ?? gamma

  useEffect(() => {
    panAxisRef.current = panAxis
  }, [panAxis])

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
        neutralAngle.current = null
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
      neutralAngle.current = null
      neutralCalibrated.current = false
      neutralSamples.current = []
      return
    }
    neutralCalibrated.current = false
    neutralAngle.current = null
    neutralSamples.current = []
    const axis = panAxisRef.current
    const timer = window.setTimeout(() => {
      const arr = neutralSamples.current
      if (arr.length > 0) {
        neutralAngle.current = arr.reduce((a, v) => a + v, 0) / arr.length
      } else {
        neutralAngle.current = 0
      }
      neutralCalibrated.current = true
      if (axis === 'alpha' && maxPan > 0) {
        setPanPx(centeredPanPx(maxPan))
      }
    }, NEUTRAL_CALIB_MS)
    return () => window.clearTimeout(timer)
  }, [orientState, neutralEpoch, axisEpoch, maxPan])

  useEffect(() => {
    if (orientState !== 'active' || angle === null) {
      return
    }
    if (panAxis === 'gamma' && Math.abs(angle) > GAMMA_SAMPLE_MAX_ABS) {
      return
    }
    if (neutralCalibrated.current) {
      return
    }
    neutralSamples.current.push(angle)
  }, [orientState, angle, panAxis])

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
        orientationEnabled &&
        !dragging.current &&
        orientState === 'active' &&
        angle !== null &&
        neutralCalibrated.current
      ) {
        if (panAxis === 'gamma' && Math.abs(angle) > GAMMA_SAMPLE_MAX_ABS) {
          raf = window.requestAnimationFrame(tick)
          return
        }
        if (maxPan > 0) {
          if (neutralAngle.current === null) {
            neutralAngle.current = angle
          }
          const target = orientationToTargetPan(
            angle,
            maxPan,
            neutralAngle.current,
            panMode,
            useCircularDelta,
          )
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
  }, [
    orientationEnabled,
    orientState,
    angle,
    maxPan,
    panAxis,
    panMode,
    useCircularDelta,
  ])

  const centerNorm = useMemo(
    () => normalizedViewportCenter(panPx, containerW, effectiveDisplayW),
    [panPx, containerW, effectiveDisplayW],
  )

  const centerHitHotspots = useMemo(
    () => hotspots.filter((hs) => !isMascotDialogHotspot(hs)),
    [hotspots],
  )

  useEffect(() => {
    if (!onHotspotCenterHit) {
      return
    }
    if (centerHitHotspots.length === 0) {
      onHotspotCenterHit(null)
      return
    }
    const hit = hitTestHotspot(
      { x: centerNorm.x, y: centerNorm.y },
      centerHitHotspots,
    )
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
  }, [centerNorm, centerHitHotspots, onHotspotCenterHit])

  useEffect(() => {
    if (!debugViewer) {
      return
    }
    const axisLabel = panAxis === 'alpha' ? 'α' : 'γ'
    const id = window.setInterval(() => {
      setDebugHud(
        `${orientState} | axis:${axisLabel} | α:${alpha?.toFixed(1) ?? '—'} | γ:${gamma?.toFixed(1) ?? '—'} | ∠:${angle?.toFixed(1) ?? '—'} | n:${neutralAngle.current?.toFixed(1) ?? '—'} | pan:${panPxRef.current.toFixed(0)}/${maxPan.toFixed(0)} | dw:${effectiveDisplayW.toFixed(0)}/${containerW} | z:${zoom.toFixed(2)}`,
      )
    }, 100)
    return () => window.clearInterval(id)
  }, [
    debugViewer,
    orientState,
    panAxis,
    alpha,
    gamma,
    angle,
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
      if (angle !== null && maxPan > 0) {
        neutralAngle.current = neutralAngleForPan(
          angle,
          panPxRef.current,
          maxPan,
          panMode,
          useCircularDelta,
        )
        neutralCalibrated.current = true
      }
    },
    [angle, maxPan, panMode, useCircularDelta],
  )

  const recenterView = useCallback(() => {
    if (maxPan > 0) {
      setPanPx(panAxis === 'alpha' ? centeredPanPx(maxPan) : 0)
    } else {
      setPanPx(0)
    }
    if (angle !== null) {
      neutralAngle.current = angle
      neutralCalibrated.current = true
    }
  }, [angle, maxPan, panAxis])

  useImperativeHandle(ref, () => ({ recenterView }), [recenterView])

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

  const viewerHeightStyle = isHero
    ? { height: '100%' as const }
    : { height: ROOM_VIEWER_HEIGHT_CSS }

  if (broken) {
    return (
      <div
        className={`flex w-full items-center justify-center bg-brand-sky-50 px-4 text-center text-sm font-medium text-fg-1 ${isHero ? 'h-full' : 'rounded-[var(--r-md)]'}`}
        style={viewerHeightStyle}
      >
        Raumbild konnte nicht geladen werden.
      </div>
    )
  }

  const orientationControls =
    orientState === 'needs-gesture' ? (
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
        <p className="text-center text-xs text-fg-2">
          Handy vor die Brust halten und nach links oder rechts drehen.
        </p>
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
    )

  return (
    <div className={isHero ? 'h-full' : 'flex flex-col gap-2'}>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden bg-bg-dark ${isHero ? 'h-full' : 'rounded-[var(--r-md)]'}`}
        style={{
          ...viewerHeightStyle,
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
              onLoad={(e) => {
                const img = e.currentTarget
                setNaturalW(img.naturalWidth)
                setNaturalH(img.naturalHeight)
              }}
              onError={() => setBroken(true)}
            />
            <HotspotOverlay
              hotspots={hotspots}
              medien={medien}
              activeHotspotId={activeHotspotId}
              speakingRolle={speakingRolle}
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
            onLoad={(e) => {
              const img = e.currentTarget
              setNaturalW(img.naturalWidth)
              setNaturalH(img.naturalHeight)
            }}
            onError={() => setBroken(true)}
          />
        )}

        {/* hero-Modus: iOS-Permission-Overlay (blockiert Gyro ohne Berechtigung) */}
        {isHero && orientState === 'needs-gesture' ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/50 px-6">
            <p className="text-center text-sm text-fg-on-dark">
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
        ) : null}

      </div>
      {!isHero ? orientationControls : null}
    </div>
  )
},
)
