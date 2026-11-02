'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { SphereHotspotCalib } from '@/components/mpz-studio/sphere-hotspot-calib'
import { SphereStartblickCalib } from '@/components/mpz-studio/sphere-startblick-calib'
import { SphereStartblickCrosshair } from '@/components/mpz-studio/sphere-startblick-crosshair'
import { SphereRaumViewer } from '@/components/raum-viewer/sphere-raum-viewer'
import type {
  SphereCalibClick,
  SphereCalibView,
} from '@/components/raum-viewer/sphere-raum-viewer-inner'
import type { Hotspot360 } from '@/lib/types'

type SphereCalibTab = 'hotspots' | 'startblick'

export type SphereCalibShellProps = {
  slug: string
  titel: string
  panorama360: string
  hotspots360: Hotspot360[]
  startYaw?: number
  startPitch?: number
}

export function SphereCalibShell({
  slug,
  titel,
  panorama360,
  hotspots360,
  startYaw,
  startPitch,
}: SphereCalibShellProps) {
  const [tab, setTab] = useState<SphereCalibTab>('hotspots')
  const [calibClick, setCalibClick] = useState<SphereCalibClick | null>(null)
  const [getCurrentView, setGetCurrentView] = useState<
    (() => SphereCalibView | null) | null
  >(null)

  const handleCalibClick = useCallback((click: SphereCalibClick) => {
    setCalibClick(click)
  }, [])

  const handleCalibViewReady = useCallback(
    (getter: () => SphereCalibView | null) => {
      setGetCurrentView(() => getter)
    },
    [],
  )

  return (
    <div className="flex min-h-[calc(100dvh-0px)] flex-col bg-[#0f1420] text-fg-on-dark">
      <div className="flex h-[50px] shrink-0 items-center gap-3 border-b border-white/10 bg-[#1a2035] px-5">
        <Link
          href="/mpz/studio/stationen"
          className="text-sm text-white/60 hover:text-white/90"
        >
          ← Zurück
        </Link>
        <span className="text-white/30">|</span>
        <span className="text-sm text-white/80">
          Sphere-Kalibrierung · <span className="font-mono">{slug}</span>
        </span>
        <span className="ml-auto rounded-full border border-brand-sun/40 bg-brand-sun/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-sun">
          calib · nur lokal
        </span>
      </div>

      <div className="flex shrink-0 gap-1 border-b border-white/10 bg-[#1a2035] px-5 py-2">
        <button
          type="button"
          className={`rounded-[var(--r-sm)] px-3 py-1.5 text-sm font-medium ${
            tab === 'hotspots'
              ? 'bg-accent text-fg-on-dark'
              : 'text-white/60 hover:text-white/90'
          }`}
          onClick={() => setTab('hotspots')}
        >
          Hotspots
        </button>
        <button
          type="button"
          className={`rounded-[var(--r-sm)] px-3 py-1.5 text-sm font-medium ${
            tab === 'startblick'
              ? 'bg-accent text-fg-on-dark'
              : 'text-white/60 hover:text-white/90'
          }`}
          onClick={() => setTab('startblick')}
        >
          Startblick
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative min-h-[50vh] flex-1 bg-brand-navy md:min-h-0">
          <div className="relative h-[calc(100svh-6.5rem)] min-h-[50vh]">
            <SphereRaumViewer
              stationSlug={slug}
              panorama={panorama360}
              alt={`360°-Ansicht ${titel}`}
              startYaw={startYaw}
              startPitch={startPitch}
              hotspots360={hotspots360}
              medien={[]}
              layout="hero"
              orientationEnabled
              calibMode
              calibUi="external"
              onCalibClick={handleCalibClick}
              onCalibViewReady={handleCalibViewReady}
            />
            {tab === 'startblick' ? <SphereStartblickCrosshair /> : null}
          </div>
        </div>

        {tab === 'hotspots' ? (
          <SphereHotspotCalib
            slug={slug}
            titel={titel}
            hotspots360={hotspots360}
            calibClick={calibClick}
          />
        ) : (
          <SphereStartblickCalib
            slug={slug}
            savedStartYaw={startYaw}
            savedStartPitch={startPitch}
            getCurrentView={getCurrentView}
          />
        )}
      </div>
    </div>
  )
}
