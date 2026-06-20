'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FlatHotspotCalib } from '@/components/mpz-studio/flat-hotspot-calib'
import { FlatStartPanCalib } from '@/components/mpz-studio/flat-startpan-calib'
import type { Hotspot } from '@/lib/types'

type FlatCalibTab = 'hotspots' | 'startpan'

export type FlatCalibShellProps = {
  slug: string
  titel: string
  bild: string
  hotspots: Hotspot[]
  startPanX?: number
}

export function FlatCalibShell({
  slug,
  titel,
  bild,
  hotspots,
  startPanX,
}: FlatCalibShellProps) {
  const [tab, setTab] = useState<FlatCalibTab>('hotspots')

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
          Flat-Kalibrierung · <span className="font-mono">{slug}</span>
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
            tab === 'startpan'
              ? 'bg-accent text-fg-on-dark'
              : 'text-white/60 hover:text-white/90'
          }`}
          onClick={() => setTab('startpan')}
        >
          Startpan
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {tab === 'hotspots' ? (
          <FlatHotspotCalib
            embedded
            slug={slug}
            titel={titel}
            bild={bild}
            hotspots={hotspots}
          />
        ) : (
          <FlatStartPanCalib
            slug={slug}
            titel={titel}
            bild={bild}
            savedStartPanX={startPanX}
          />
        )}
      </div>
    </div>
  )
}
