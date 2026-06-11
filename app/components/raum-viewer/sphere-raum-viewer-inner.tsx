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
  ROOM_VIEWER_HEIGHT_CSS,
  SPHERE_GYRO_ROLL_ENABLED,
} from '@/lib/raum-viewer/constants'
import type { RaumViewerLayout } from '@/components/raum-viewer/raum-viewer'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'
import { buildSphereMarkerHtml } from '@/lib/raum-viewer/sphere-marker-html'
import { isMascotDialogHotspot } from '@/lib/dialog-hotspot'

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
}

const VIEWER_HEIGHT_STYLE_DEFAULT = {
  height: ROOM_VIEWER_HEIGHT_CSS,
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
  const [ready, setReady] = useState(false)

  const { state: orientState, requestAccess } = useDeviceOrientation(orientationEnabled)

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

  // Auto-start on Android / non-iOS (no permission dialog needed)
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
        const pos = viewer.dataHelper.sphericalCoordsToViewerCoords({
          yaw: hs.yaw * (Math.PI / 180),
          pitch: hs.pitch * (Math.PI / 180),
        })
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

    // Panorama bewusst NICHT im Konstruktor — React StrictMode zerstört den ersten
    // Viewer während THREE.FileLoader noch lädt (globales Dedup-Register). Erst nach
    // dem Mount per rAF laden, damit nur der überlebende Viewer fetcht.
    const viewer = new Viewer({
      container: el,
      caption: alt,
      navbar: false,
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

    // PSV's __checkSupport() resolves on the very first 'deviceorientation' event,
    // which may carry alpha=null on Android during sensor calibration. Replace the
    // isSupported promise so it waits for the first event with a valid alpha value.
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
      loadedPanoramaRef.current = null
      viewer.destroy()
      viewerRef.current = null
      markersPluginRef.current = null
      gyroPluginRef.current = null
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alt, orientationEnabled])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !ready) return
    if (loadedPanoramaRef.current === panorama) return
    loadedPanoramaRef.current = panorama
    void viewer.setPanorama(panorama).catch(() => {})
  }, [panorama, ready])

  useEffect(() => {
    const plugin = markersPluginRef.current
    if (!plugin || !ready) return

    plugin.clearMarkers()
    if (!hotspots360?.length) return

    const containerHeight = viewerRef.current?.getSize().height ?? 400

    for (const hs of hotspots360) {
      const isActive = hs.id === activeHotspotId
      plugin.addMarker({
        id: hs.id,
        position: {
          yaw: hs.yaw * (Math.PI / 180),
          pitch: hs.pitch * (Math.PI / 180),
        },
        html: buildSphereMarkerHtml({
          hs,
          medien,
          containerHeight,
          isActive,
          speakingRolle,
        }),
        anchor: isMascotDialogHotspot(hs) ? 'bottom center' : 'center center',
        tooltip: hs.label ?? undefined,
      })
    }
  }, [hotspots360, medien, activeHotspotId, speakingRolle, ready])

  return (
    <div
      className={`relative w-full overflow-hidden bg-bg-dark ${isHero ? 'h-full' : 'rounded-[var(--r-md)]'}`}
      style={isHero ? undefined : VIEWER_HEIGHT_STYLE_DEFAULT}
      aria-label={alt}
    >
      <div ref={containerRef} className="h-full w-full" />
      <PanOnboardingOverlay mode="sphere" skip={orientState === 'needs-gesture'} />
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
