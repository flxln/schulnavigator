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
import { ROOM_VIEWER_HEIGHT_CSS } from '@/lib/raum-viewer/constants'
import type { RaumViewerLayout } from '@/components/raum-viewer/raum-viewer'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'

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
    speakingRolle: _speakingRolle,
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
    if (!plugin || !orientationEnabled || plugin.isEnabled()) return
    try {
      await plugin.start()
    } catch {
      // denied or unsupported — touch/drag remains as fallback
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
                },
              ] as [typeof GyroscopePlugin, object],
            ]
          : []),
      ],
    })

    viewerRef.current = viewer
    markersPluginRef.current = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
    gyroPluginRef.current = orientationEnabled
      ? (viewer.getPlugin(GyroscopePlugin) as GyroscopePlugin)
      : null

    viewer.addEventListener('position-updated', (e) => {
      onViewChangeRef.current?.(
        e.position.yaw * (180 / Math.PI),
        e.position.pitch * (180 / Math.PI),
      )
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

    for (const hs of hotspots360) {
      const isActive = hs.id === activeHotspotId
      plugin.addMarker({
        id: hs.id,
        position: {
          yaw: hs.yaw * (Math.PI / 180),
          pitch: hs.pitch * (Math.PI / 180),
        },
        html: buildMarkerHtml(hs, medien, isActive),
        anchor: 'bottom center',
        tooltip: hs.label ?? undefined,
      })
    }
  }, [hotspots360, medien, activeHotspotId, ready])

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
            onClick={() => void requestAccess()}
          >
            Orientierung aktivieren
          </button>
        </div>
      ) : null}
    </div>
  )
})

SphereRaumViewerInner.displayName = 'SphereRaumViewerInner'

function buildMarkerHtml(
  hs: Hotspot360,
  _medien: Medium[],
  isActive: boolean,
): string {
  const baseClass =
    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform'
  const colorClass =
    hs.action === 'dialog'
      ? isActive
        ? 'border-accent bg-accent/90 text-fg-on-dark scale-110'
        : 'border-accent bg-brand-sky-50/90 text-accent'
      : isActive
        ? 'border-yellow-400 bg-yellow-400 text-fg-1 scale-110'
        : 'border-yellow-400 bg-yellow-300/90 text-fg-1'
  return `<div class="${baseClass} ${colorClass}" aria-label="${hs.label ?? hs.id}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      ${hs.action === 'dialog'
        ? '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
        : '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}
    </svg>
  </div>`
}
