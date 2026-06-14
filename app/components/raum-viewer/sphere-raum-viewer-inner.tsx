'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import type {
  Hotspot360,
  Medium,
  DialogRolle,
  ScreenProjection,
  StationViewerHandle,
} from '@/lib/types'
import {
  SPHERE_GYRO_ROLL_ENABLED,
  SPHERE_LOCKED_FOV_DEG,
  SPHERE_LOCKED_FOV_EPSILON_DEG,
} from '@/lib/raum-viewer/constants'
import type { RaumViewerLayout } from '@/components/raum-viewer/raum-viewer'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'
import { SphereHotspotCalibOverlay } from '@/components/raum-viewer/sphere-hotspot-calib-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'
import { computeViewerBlocksCoach } from '@/lib/raum-viewer/viewer-coach-gate'
import {
  applyMascotElementState,
  buildSphereMarkerConfig,
  buildSphereMarkerVisualUpdate,
  type SphereMarkerKind,
} from '@/lib/raum-viewer/sphere-marker-factory'
import {
  resolveBubbleProjectionPitchDeg,
  resolveImageLayerSize,
  yawPitchToRadians,
} from '@/lib/raum-viewer/sphere-marker-conventions'

export type SphereRaumViewerInnerProps = {
  panorama: string
  alt: string
  hotspots360?: Hotspot360[]
  medien: Medium[]
  activeHotspotId?: string | null
  speakingRolle?: DialogRolle | null
  onHotspotTap?: (hotspot: Hotspot360) => void
  onViewChange?: (yaw: number, pitch: number) => void
  onContainerReady?: (width: number, height: number) => void
  layout?: RaumViewerLayout
  orientationEnabled?: boolean
  onViewerCoachGateChange?: (blocksCoach: boolean) => void
}

const VIEWER_HEIGHT_CLASS_DEFAULT = 'sn-viewer-fallback-height'

function isHotspotCalibEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('hotspot-calib') === '1'
}

export const SphereRaumViewerInner = forwardRef<
  StationViewerHandle,
  SphereRaumViewerInnerProps
>(function SphereRaumViewerInner(
  {
    panorama,
    alt,
    hotspots360,
    medien,
    activeHotspotId,
    speakingRolle,
    onHotspotTap,
    onViewChange,
    onContainerReady,
    layout = 'default',
    orientationEnabled = true,
    onViewerCoachGateChange,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const markersPluginRef = useRef<MarkersPlugin | null>(null)
  const gyroPluginRef = useRef<GyroscopePlugin | null>(null)
  const onViewChangeRef = useRef(onViewChange)
  const onHotspotTapRef = useRef(onHotspotTap)
  const onContainerReadyRef = useRef(onContainerReady)
  const hotspots360Ref = useRef(hotspots360)
  const loadedPanoramaRef = useRef<string | null>(null)
  const orientStateRef = useRef<string>('checking')
  const startGyroRef = useRef<() => Promise<void>>(async () => {})
  const markerKindsRef = useRef<Map<string, SphereMarkerKind>>(new Map())
  const mascotElementsRef = useRef<Map<string, HTMLElement>>(new Map())
  const [ready, setReady] = useState(false)
  const [panOnboardingActive, setPanOnboardingActive] = useState(false)
  const [calibEnabled] = useState(isHotspotCalibEnabled)
  const [calibClick, setCalibClick] = useState<{
    yaw: number
    pitch: number
    textureX?: number
    textureY?: number
  } | null>(null)

  const { state: orientState, requestAccess } = useDeviceOrientation(orientationEnabled)

  const handlePanOnboardingActiveChange = useCallback((active: boolean) => {
    setPanOnboardingActive(active)
  }, [])

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

  useEffect(() => { orientStateRef.current = orientState }, [orientState])

  useEffect(() => { onViewChangeRef.current = onViewChange }, [onViewChange])
  useEffect(() => { onHotspotTapRef.current = onHotspotTap }, [onHotspotTap])
  useEffect(() => { onContainerReadyRef.current = onContainerReady }, [onContainerReady])
  useEffect(() => { hotspots360Ref.current = hotspots360 }, [hotspots360])

  const isHero = layout === 'hero'

  const startGyroIfPossible = useCallback(async () => {
    const plugin = gyroPluginRef.current
    if (!plugin || !orientationEnabled || plugin.isEnabled()) {
      return
    }
    try {
      await plugin.start()
    } catch {
      // Gyroskop nicht verfügbar oder verweigert — stiller Fallback auf Touch-Steuerung
    }
  }, [orientationEnabled])

  useEffect(() => { startGyroRef.current = startGyroIfPossible }, [startGyroIfPossible])

  useEffect(() => {
    if (!ready || orientState !== 'active') return
    void startGyroIfPossible()
  }, [ready, orientState, startGyroIfPossible])

  useImperativeHandle(ref, () => ({
    recenterView() {
      viewerRef.current?.animate({ yaw: 0, pitch: 0, speed: '3rpm' })
    },
    focusHotspot(id: string) {
      const hs = hotspots360Ref.current?.find((h) => h.id === id)
      if (hs) {
        viewerRef.current?.animate({
          yaw: hs.yaw * (Math.PI / 180),
          pitch: hs.pitch * (Math.PI / 180),
          speed: '4rpm',
        })
      }
    },
    projectHotspot(id: string): ScreenProjection | null {
      const viewer = viewerRef.current
      const hs = hotspots360Ref.current?.find((h) => h.id === id)
      if (!viewer || !hs) return null
      try {
        const bubblePitchDeg = resolveBubbleProjectionPitchDeg(hs)
        const pos = viewer.dataHelper.sphericalCoordsToViewerCoords(
          yawPitchToRadians(hs.yaw, bubblePitchDeg),
        )
        const container = viewer.getSize()
        const visible =
          pos.x >= 0 &&
          pos.x <= container.width &&
          pos.y >= 0 &&
          pos.y <= container.height
        return { x: pos.x, y: pos.y, visible }
      } catch {
        return null
      }
    },
  }), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const viewer = new Viewer({
      container: el,
      caption: alt,
      navbar: false,
      minFov: SPHERE_LOCKED_FOV_DEG - SPHERE_LOCKED_FOV_EPSILON_DEG,
      maxFov: SPHERE_LOCKED_FOV_DEG,
      defaultZoomLvl: 0,
      mousewheel: false,
      plugins: [
        [
          MarkersPlugin,
          {
            markers: [],
          },
        ],
        ...(orientationEnabled
          ? [
              [
                GyroscopePlugin,
                {
                  touchmove: true,
                  absolutePosition: false,
                  roll: SPHERE_GYRO_ROLL_ENABLED,
                },
              ] as [typeof GyroscopePlugin, object],
            ]
          : []),
      ],
    })

    viewerRef.current = viewer
    markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
    const gyroPlugin = orientationEnabled
      ? (viewer.getPlugin(GyroscopePlugin) as GyroscopePlugin)
      : null
    gyroPluginRef.current = gyroPlugin

    let pinchGyroResumePending = false
    let gyroWasEnabledBeforeTouch = false
    const onTouchStart = (evt: TouchEvent) => {
      if (gyroPlugin?.isEnabled()) {
        gyroWasEnabledBeforeTouch = true
      }
      if (evt.touches.length >= 2 && gyroPlugin?.isEnabled()) {
        pinchGyroResumePending = true
      }
    }
    const onTouchEnd = (evt: TouchEvent) => {
      const resumeAfterTouch =
        evt.touches.length === 0 &&
        (pinchGyroResumePending || gyroWasEnabledBeforeTouch) &&
        gyroPlugin &&
        !gyroPlugin.isEnabled()
      if (evt.touches.length !== 0) return
      pinchGyroResumePending = false
      gyroWasEnabledBeforeTouch = false
      if (!resumeAfterTouch) return
      if (!orientationEnabled || orientStateRef.current !== 'active') return
      void startGyroRef.current()
    }
    el.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    if (
      gyroPlugin &&
      typeof (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } })
        .DeviceOrientationEvent?.requestPermission !== 'function'
    ) {
      const gpState = (
        gyroPlugin as unknown as { state: { isSupported: Promise<boolean> } }
      ).state
      gpState.isSupported = new Promise<boolean>((resolve) => {
        let done = false
        const onEvt = (e: DeviceOrientationEvent) => {
          if (done) return
          if (e.alpha !== null && !isNaN(e.alpha)) {
            done = true
            window.removeEventListener('deviceorientation', onEvt)
            resolve(true)
          }
        }
        window.addEventListener('deviceorientation', onEvt)
        window.setTimeout(() => {
          if (!done) {
            done = true
            window.removeEventListener('deviceorientation', onEvt)
            resolve(false)
          }
        }, 10_000)
      })
    }

    viewer.addEventListener('position-updated', (e) => {
      const yawDeg = e.position.yaw * (180 / Math.PI)
      const pitchDeg = e.position.pitch * (180 / Math.PI)
      onViewChangeRef.current?.(yawDeg, pitchDeg)
    })

    if (calibEnabled) {
      viewer.addEventListener('click', (e) => {
        setCalibClick({
          yaw: e.data.yaw,
          pitch: e.data.pitch,
          textureX: e.data.textureX,
          textureY: e.data.textureY,
        })
      })
    }

    const markersPlugin = markersPluginRef.current
    if (markersPlugin) {
      markersPlugin.addEventListener('select-marker', (e) => {
        const id = e.marker.id
        const hs = hotspots360Ref.current?.find((h) => h.id === id)
        if (hs) onHotspotTapRef.current?.(hs)
      })
    }

    viewer.addEventListener('ready', () => {
      setReady(true)
      const size = viewer.getSize()
      onContainerReadyRef.current?.(size.width, size.height)
    }, { once: true })

    let destroyed = false
    const rafId = requestAnimationFrame(() => {
      if (destroyed) return
      loadedPanoramaRef.current = panorama
      void viewer.setPanorama(panorama).catch(() => {})
    })

    return () => {
      destroyed = true
      cancelAnimationFrame(rafId)
      el.removeEventListener('touchstart', onTouchStart, { capture: true })
      el.removeEventListener('touchend', onTouchEnd)
      loadedPanoramaRef.current = null
      markerKindsRef.current.clear()
      mascotElementsRef.current.clear()
      viewer.destroy()
      viewerRef.current = null
      markersPluginRef.current = null
      gyroPluginRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, orientationEnabled, calibEnabled])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !ready) return
    if (loadedPanoramaRef.current === panorama) return
    loadedPanoramaRef.current = panorama
    void viewer.setPanorama(panorama).catch(() => {})
  }, [panorama, ready])

  // Marker-Struktur: einmal anlegen/entfernen bei Hotspot- oder Medien-Änderung
  useEffect(() => {
    const plugin = markersPluginRef.current
    if (!plugin || !ready) return

    const list = hotspots360 ?? []
    const nextIds = new Set(list.map((h) => h.id))
    const viewerSize = viewerRef.current?.getSize()
    const containerHeight = viewerSize?.height ?? 400
    const layoutViewportWidth = viewerSize?.width

    for (const id of [...markerKindsRef.current.keys()]) {
      if (!nextIds.has(id)) {
        plugin.removeMarker(id)
        markerKindsRef.current.delete(id)
        mascotElementsRef.current.delete(id)
      }
    }

    for (const hs of list) {
      if (markerKindsRef.current.has(hs.id)) continue
      const built = buildSphereMarkerConfig({
        hs,
        medien,
        containerHeight,
        layoutViewportWidth,
        isActive: false,
        speakingRolle: null,
      })
      markerKindsRef.current.set(hs.id, built.kind)
      if (built.mascotElement) {
        mascotElementsRef.current.set(hs.id, built.mascotElement)
      }
      plugin.addMarker(built.config as Parameters<MarkersPlugin['addMarker']>[0])
    }
  }, [hotspots360, medien, ready])

  // Visueller Zustand: updateMarker / DOM-Mutation ohne Rebuild
  useEffect(() => {
    const plugin = markersPluginRef.current
    if (!plugin || !ready || !hotspots360?.length) return

    const viewerSize = viewerRef.current?.getSize()
    const containerHeight = viewerSize?.height ?? 400
    const layoutViewportWidth = viewerSize?.width

    for (const hs of hotspots360) {
      const kind = markerKindsRef.current.get(hs.id)
      if (!kind) continue

      const options = {
        hs,
        medien,
        containerHeight,
        layoutViewportWidth,
        isActive: hs.id === activeHotspotId,
        speakingRolle,
      }

      if (kind === 'htmlMascot') {
        const el = mascotElementsRef.current.get(hs.id)
        if (el) {
          applyMascotElementState(
            el,
            hs,
            containerHeight,
            hs.id === activeHotspotId,
            speakingRolle,
          )
        }
        continue
      }

      plugin.updateMarker(
        buildSphereMarkerVisualUpdate(options, kind) as Parameters<
          MarkersPlugin['updateMarker']
        >[0],
      )
    }
  }, [hotspots360, medien, activeHotspotId, speakingRolle, ready])

  return (
    <div
      className={`relative w-full overflow-hidden bg-bg-dark ${isHero ? 'h-full' : `rounded-[var(--r-md)] ${VIEWER_HEIGHT_CLASS_DEFAULT}`}`}
      aria-label={alt}
    >
      <div ref={containerRef} className="h-full w-full" />
      <PanOnboardingOverlay
        mode="sphere"
        skip={panOnboardingSkip}
        onActiveChange={handlePanOnboardingActiveChange}
      />
      {calibEnabled ? (
        <SphereHotspotCalibOverlay
          hotspots360={hotspots360}
          lastClick={calibClick}
        />
      ) : null}
      {isHero && orientState === 'needs-gesture' ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/50 px-6">
          <p className="text-center text-sm text-fg-on-dark">
            Für die Raum-Bewegung bitte Orientierung erlauben (einmalig).
          </p>
          <button
            type="button"
            className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark shadow-gs39-sm hover:bg-accent-hover"
            onClick={() => {
              void requestAccess()
            }}
          >
            Orientierung aktivieren
          </button>
        </div>
      ) : null}
    </div>
  )
})

SphereRaumViewerInner.displayName = 'SphereRaumViewerInner'
