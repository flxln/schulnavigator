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
  GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG,
  GYRO_GAMMA_PAN_SIGN,
  HOTSPOT_CENTER_DWELL_MS,
  HOTSPOT_DEBOUNCE_MS,
  MIN_PAN_DISPLAY_RATIO,
  PAN_SMOOTHING,
  PORTRAIT_GAMMA_FALLBACK_ENABLED,
  RECOMMENDED_SOURCE_ASPECT_MIN,
  ROOM_VIEWER_HEIGHT_CSS,
  ROOM_VIEWER_MAX_HEIGHT_PX,
  maxPanPx,
} from '@/lib/raum-viewer/constants'
import { visibleYNormalRange } from '@/lib/raum-viewer/clip-zone'
import {
  centeredPanPx,
  isGimbalLock,
  lerpPan,
  neutralAngleForPan,
  orientationToTargetPan,
  panMappingForAxis,
  type PanMappingOpts,
} from '@/lib/raum-viewer/pan-from-orientation'
import { panPxAfterRecenter } from '@/lib/raum-viewer/recenter-pan'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'
import { isMascotDialogHotspot } from '@/lib/dialog-hotspot'
import { hitTestHotspot } from '@/lib/raum-viewer/hit-test-hotspot'
import { normalizedViewportCenter } from '@/lib/raum-viewer/viewport-center'
import { HotspotOverlay } from '@/components/raum-viewer/hotspot-overlay'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'
import { computeViewerBlocksCoach } from '@/lib/raum-viewer/viewer-coach-gate'
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
  onPanChange?: (
    panPx: number,
    effectiveDisplayW: number,
    containerW: number,
    containerH: number,
  ) => void
  layout?: RaumViewerLayout
  orientationEnabled?: boolean
  onViewerCoachGateChange?: (blocksCoach: boolean) => void
}

export type RoomImagePaneHandle = {
  recenterView: () => void
}

const NEUTRAL_CALIB_MS = 500
const RESIZE_RESET_PX = 5
const GAMMA_SAMPLE_MAX_ABS = 90

const GAMMA_FALLBACK_OPTS: PanMappingOpts = {
  sign: GYRO_GAMMA_PAN_SIGN,
  fullRangeDeg: GYRO_GAMMA_FALLBACK_FULL_RANGE_DEG,
}

/** Portrait-Lock nur, wenn der γ-Fallback aktiviert ist (sonst durchgehend α). */
function portraitLock(beta: number, wasLocked: boolean): boolean {
  if (!PORTRAIT_GAMMA_FALLBACK_ENABLED) {
    return false
  }
  return isGimbalLock(beta, wasLocked)
}

function mean(samples: readonly number[]): number {
  if (samples.length === 0) {
    return 0
  }
  return samples.reduce((a, v) => a + v, 0) / samples.length
}

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
      onPanChange,
      layout = 'default',
      orientationEnabled = true,
      onViewerCoachGateChange,
    },
    ref,
  ) {
  const isHero = layout === 'hero'
  const [debugViewer, setDebugViewer] = useState(false)
  const [panOnboardingActive, setPanOnboardingActive] = useState(false)

  const handlePanOnboardingActiveChange = useCallback((active: boolean) => {
    setPanOnboardingActive(active)
  }, [])

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

  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, pan: 0 })
  const neutralAlpha = useRef<number | null>(null)
  const neutralGamma = useRef<number | null>(null)
  const neutralCalibrated = useRef(false)
  const alphaSamples = useRef<number[]>([])
  const gammaSamples = useRef<number[]>([])
  const betaSamples = useRef<number[]>([])
  const lockedRef = useRef(false)
  const lockSettledAt = useRef<number>(0)
  const needsReanchorGamma = useRef(false)
  const panPxRef = useRef(0)
  const prevContainer = useRef({ w: 0, h: 0 })
  const centerDebounce = useRef<number | null>(null)
  const centerDwell = useRef<number | null>(null)
  const pendingCenterHit = useRef<Hotspot | null>(null)
  const panAxisRef = useRef<'alpha' | 'gamma'>('alpha')
  const alphaRef = useRef<number | null>(null)
  const betaRef = useRef<number | null>(null)
  const gammaRef = useRef<number | null>(null)
  const panAngleRef = useRef<number | null>(null)

  const {
    state: orientState,
    alpha,
    beta,
    gamma,
    panAngle,
    panAxis,
    axisEpoch,
    requestAccess,
  } = useDeviceOrientation(orientationEnabled)

  useEffect(() => {
    onViewerCoachGateChange?.(
      computeViewerBlocksCoach(
        orientationEnabled,
        orientState,
        panOnboardingActive,
      ),
    )
  }, [
    orientationEnabled,
    orientState,
    panOnboardingActive,
    onViewerCoachGateChange,
  ])

  const panOnboardingSkip =
    orientState === 'needs-gesture' || orientState === 'checking'

  const panMode = panMappingForAxis(panAxis)
  const useCircularDelta = false

  useEffect(() => { alphaRef.current = alpha }, [alpha])
  useEffect(() => { betaRef.current = beta }, [beta])
  useEffect(() => { gammaRef.current = gamma }, [gamma])
  useEffect(() => { panAngleRef.current = panAngle }, [panAngle])

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

  const yBand = useMemo(
    () =>
      naturalW > 0 && naturalH > 0 && containerW > 0 && containerH > 0
        ? visibleYNormalRange(
            naturalW / naturalH,
            containerW,
            containerH,
            MIN_PAN_DISPLAY_RATIO,
          )
        : { yMin: 0, yMax: 1 },
    [naturalW, naturalH, containerW, containerH],
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
    onPanChange?.(panPx, effectiveDisplayW, containerW, containerH)
  }, [panPx, effectiveDisplayW, containerW, containerH, onPanChange])

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
        neutralAlpha.current = null
        neutralGamma.current = null
        neutralCalibrated.current = false
        alphaSamples.current = []
        gammaSamples.current = []
        betaSamples.current = []
        lockedRef.current = false
        needsReanchorGamma.current = false
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
      neutralAlpha.current = null
      neutralGamma.current = null
      neutralCalibrated.current = false
      alphaSamples.current = []
      gammaSamples.current = []
      betaSamples.current = []
      lockedRef.current = false
      needsReanchorGamma.current = false
      return
    }
    neutralCalibrated.current = false
    neutralAlpha.current = null
    neutralGamma.current = null
    alphaSamples.current = []
    gammaSamples.current = []
    betaSamples.current = []
    lockedRef.current = false
    needsReanchorGamma.current = false
    const axis = panAxisRef.current
    const timer = window.setTimeout(() => {
      if (axis === 'alpha') {
        neutralAlpha.current =
          alphaSamples.current.length > 0 ? mean(alphaSamples.current) : 0
        neutralGamma.current =
          gammaSamples.current.length > 0 ? mean(gammaSamples.current) : 0
        const betaMean =
          betaSamples.current.length > 0 ? mean(betaSamples.current) : 90
        lockedRef.current = portraitLock(betaMean, false)
      } else {
        neutralGamma.current =
          gammaSamples.current.length > 0 ? mean(gammaSamples.current) : 0
      }
      neutralCalibrated.current = true
      if (axis === 'alpha' && maxPan > 0) {
        setPanPx(centeredPanPx(maxPan))
      }
    }, NEUTRAL_CALIB_MS)
    return () => window.clearTimeout(timer)
  }, [orientState, neutralEpoch, axisEpoch, maxPan])

  useEffect(() => {
    if (orientState !== 'active' || neutralCalibrated.current) {
      return
    }
    if (panAxis === 'gamma') {
      if (gamma !== null && Math.abs(gamma) <= GAMMA_SAMPLE_MAX_ABS) {
        gammaSamples.current.push(gamma)
      }
      return
    }
    if (alpha !== null) {
      alphaSamples.current.push(alpha)
    }
    if (gamma !== null && Math.abs(gamma) <= GAMMA_SAMPLE_MAX_ABS) {
      gammaSamples.current.push(gamma)
    }
    if (beta !== null) {
      betaSamples.current.push(beta)
    }
  }, [orientState, alpha, beta, gamma, panAxis])

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
        neutralCalibrated.current &&
        maxPan > 0
      ) {
        if (panAxisRef.current === 'gamma') {
          const landscapeAngle = panAngleRef.current ?? gammaRef.current
          if (
            landscapeAngle !== null &&
            Math.abs(landscapeAngle) <= GAMMA_SAMPLE_MAX_ABS
          ) {
            if (neutralGamma.current === null) {
              neutralGamma.current = landscapeAngle
            }
            const target = orientationToTargetPan(
              landscapeAngle,
              maxPan,
              neutralGamma.current,
              panMode,
              useCircularDelta,
            )
            setPanPx((p) => lerpPan(p, target, PAN_SMOOTHING))
          }
        } else {
          const a = alphaRef.current
          const b = betaRef.current
          const g = gammaRef.current
          if (a !== null && b !== null && g !== null) {
            const locked = portraitLock(b, lockedRef.current)
            if (locked !== lockedRef.current) {
              if (locked) {
                // Entering gamma: Euler rearranges at singularity — wait, then re-anchor
                lockSettledAt.current = performance.now() + 150
                needsReanchorGamma.current = true
              } else {
                // Exiting gamma → alpha: alpha is stable, re-anchor immediately
                neutralAlpha.current = neutralAngleForPan(
                  a,
                  panPxRef.current,
                  maxPan,
                  'centered',
                  false,
                  undefined,
                )
              }
              lockedRef.current = locked
            }
            // Only freeze while waiting for gamma settle (not on exit to alpha)
            if (locked && performance.now() < lockSettledAt.current) {
              raf = window.requestAnimationFrame(tick)
              return
            }
            // Re-anchor gamma AFTER settle — Euler has stabilized, neutral is correct
            if (locked && needsReanchorGamma.current) {
              neutralGamma.current = neutralAngleForPan(
                g,
                panPxRef.current,
                maxPan,
                'centered',
                false,
                GAMMA_FALLBACK_OPTS,
              )
              needsReanchorGamma.current = false
            }
            const activeRaw = locked ? g : a
            const neutral = locked ? neutralGamma.current : neutralAlpha.current
            const opts = locked ? GAMMA_FALLBACK_OPTS : undefined
            if (neutral === null) {
              if (locked) {
                neutralGamma.current = g
              } else {
                neutralAlpha.current = a
              }
            } else {
              const target = orientationToTargetPan(
                activeRaw,
                maxPan,
                neutral,
                'centered',
                false,
                opts,
              )
              setPanPx((p) => lerpPan(p, target, PAN_SMOOTHING))
            }
          }
        }
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [orientationEnabled, orientState, maxPan, panMode, useCircularDelta])

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

  const debugHud = (() => {
    if (!debugViewer) return ''
    const portraitActive = panAxis === 'alpha' && alpha !== null && beta !== null && gamma !== null
    const locked = portraitActive ? portraitLock(beta, lockedRef.current) : false
    const activeAngle = portraitActive ? (locked ? gamma : alpha) : (panAngle ?? gamma)
    return `${orientState} | axis:${panAxis === 'alpha' ? 'α' : 'γ'} | yaw:${alpha?.toFixed(1) ?? '—'} | β:${beta?.toFixed(1) ?? '—'} | γ:${gamma?.toFixed(1) ?? '—'} | lock:${locked ? 1 : 0} | ∠:${activeAngle?.toFixed(1) ?? '—'} | nα:${neutralAlpha.current?.toFixed(1) ?? '—'} | nγ:${neutralGamma.current?.toFixed(1) ?? '—'} | pan:${panPxRef.current.toFixed(0)}/${maxPan.toFixed(0)} | dw:${effectiveDisplayW.toFixed(0)}/${containerW} | z:${zoom.toFixed(2)}`
  })()

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
      if (maxPan <= 0) {
        return
      }
      if (
        panAxis === 'alpha' &&
        alpha !== null &&
        beta !== null &&
        gamma !== null
      ) {
        const locked = portraitLock(beta, lockedRef.current)
        lockedRef.current = locked
        const activeRaw = locked ? gamma : alpha
        const opts = locked ? GAMMA_FALLBACK_OPTS : undefined
        const reAnchored = neutralAngleForPan(
          activeRaw,
          panPxRef.current,
          maxPan,
          'centered',
          false,
          opts,
        )
        if (locked) {
          neutralGamma.current = reAnchored
        } else {
          neutralAlpha.current = reAnchored
        }
        neutralCalibrated.current = true
        return
      }
      const landscapeAngle = panAngle ?? gamma
      if (landscapeAngle !== null) {
        neutralGamma.current = neutralAngleForPan(
          landscapeAngle,
          panPxRef.current,
          maxPan,
          panMode,
          useCircularDelta,
        )
        neutralCalibrated.current = true
      }
    },
    [alpha, beta, gamma, panAngle, maxPan, panAxis, panMode, useCircularDelta],
  )

  const recenterView = useCallback(() => {
    setPanPx(panPxAfterRecenter(maxPan, panAxis))
    if (
      panAxis === 'alpha' &&
      alpha !== null &&
      beta !== null &&
      gamma !== null
    ) {
      const locked = portraitLock(beta, lockedRef.current)
      lockedRef.current = locked
      if (locked) {
        neutralGamma.current = gamma
      } else {
        neutralAlpha.current = alpha
      }
      neutralCalibrated.current = true
      return
    }
    if (gamma !== null) {
      neutralGamma.current = gamma
      neutralCalibrated.current = true
    }
  }, [alpha, beta, gamma, maxPan, panAxis])

  useImperativeHandle(ref, () => ({ recenterView }), [recenterView])

  const orientationBanner = () => {
    if (
      orientState === 'active' ||
      orientState === 'needs-gesture' ||
      orientState === 'checking'
    ) {
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
              containerHeight={effectiveDisplayH}
              yBand={yBand}
              activeHotspotId={activeHotspotId}
              speakingRolle={speakingRolle}
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
            onLoad={(e) => {
              const img = e.currentTarget
              setNaturalW(img.naturalWidth)
              setNaturalH(img.naturalHeight)
            }}
            onError={() => setBroken(true)}
          />
        )}

        <PanOnboardingOverlay
          skip={panOnboardingSkip}
          onActiveChange={handlePanOnboardingActiveChange}
        />

        {debugViewer ? (
          <div className="pointer-events-none absolute bottom-1 left-1 right-1 z-20 rounded bg-white/90 px-2 py-1 font-mono text-xs leading-tight text-black">
            {debugHud}
          </div>
        ) : null}

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
