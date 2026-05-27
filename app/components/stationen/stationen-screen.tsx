'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Lock, QrCode } from 'lucide-react'
import { TopBar } from '@/components/ui/top-bar'
import { Gs39Button, Gs39Toast, Gs39ToastLayer } from '@/components/ui'
import type { EntryMode } from '@/lib/access-tokens'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSlugsForMode, isHubStationNavigable } from '@/lib/hub-mode'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'
import { mixHex } from '@/lib/gs39-hex-blend'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'

type StationenScreenProps = {
  mode: EntryMode
  hubStations: readonly IsometricHubStation[]
  validSlugs: readonly string[]
}

export function StationenScreen({
  mode,
  hubStations,
  validSlugs,
}: StationenScreenProps) {
  const router = useRouter()
  const { visitedSlugs, visitedCount, isHydrated } =
    useVisitedStations(validSlugs)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const stationSlugs = useMemo(
    () => hubStations.map((s) => s.slug),
    [hubStations],
  )

  const unlockedSlugs = useMemo(
    () => getUnlockedSlugsForMode(mode, stationSlugs, visitedSlugs),
    [mode, stationSlugs, visitedSlugs],
  )

  useEffect(() => {
    if (!toastMessage) return
    const t = window.setTimeout(() => setToastMessage(null), 2400)
    return () => window.clearTimeout(t)
  }, [toastMessage])

  const onStationTap = useCallback(
    (station: IsometricHubStation) => {
      if (!isHubStationNavigable(station.slug, unlockedSlugs)) {
        setToastMessage(
          `„${station.titel}" — bitte an der Tür scannen.`,
        )
        return
      }
      router.push(`/raum/${station.slug}`)
    },
    [unlockedSlugs, router],
  )

  const festHint =
    mode === 'fest' ? ' · gesperrte Stationen brauchen den Raum-QR' : ''

  return (
    <div className="sn-fade-in flex min-h-full flex-col">
      <TopBar
        title="Alle Stationen"
        onBack={() => router.push('/')}
        tight
      />

      <div className="flex flex-1 flex-col gap-2.5 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <header className="px-1 pb-3 pt-1">
          <p className="t-eyebrow text-[11px]">Schulhaus-Übersicht</p>
          <h1 className="sn-brush mt-1 text-[28px] leading-none">
            11 Stationen <span className="sn-brush-hl">entdecken</span>
          </h1>
          <p className="mt-2 text-sm text-fg-3">
            {isHydrated
              ? `${visitedCount} von ${hubStations.length} besucht${festHint}`
              : 'Fortschritt wird geladen…'}
          </p>
        </header>

        <ul className="flex flex-col gap-2.5" aria-label="Stationen">
          {hubStations.map((station) => {
            const visited = visitedSlugs.has(station.slug)
            const locked =
              mode === 'fest' &&
              isHydrated &&
              !isHubStationNavigable(station.slug, unlockedSlugs)
            const tileBg = locked
              ? GS39_BRAND_HEX.paper50
              : mixHex(station.accent, GS39_BRAND_HEX.paper50, 0.18)

            return (
              <li key={station.slug}>
                <button
                  type="button"
                  onClick={() => onStationTap(station)}
                  className={[
                    'sn-card flex w-full items-center gap-3 p-3 text-left',
                    locked ? 'sn-card--locked' : 'sn-card--interactive',
                  ].join(' ')}
                >
                  <div
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-[var(--r-sm)] font-display text-2xl leading-none tracking-wide"
                    style={{
                      background: tileBg,
                      color: locked ? GS39_BRAND_HEX.navy300 : station.accent,
                      filter: locked ? 'grayscale(0.5)' : undefined,
                    }}
                    aria-hidden
                  >
                    {station.nr}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-extrabold text-fg-1">
                      {station.titel}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-fg-3">
                      Station {station.nr}
                    </p>
                  </div>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                    {visited ? (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-green text-fg-on-dark">
                        <Check size={16} aria-hidden />
                      </span>
                    ) : locked ? (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-bg-3 text-fg-3">
                        <Lock size={14} aria-hidden />
                      </span>
                    ) : (
                      <ArrowLeft
                        size={18}
                        className="rotate-180 text-fg-1"
                        aria-hidden
                      />
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {mode === 'fest' ? (
          <Gs39Button
            block
            className="mt-2 gap-2"
            onClick={() => router.push('/scan')}
          >
            <QrCode size={22} aria-hidden />
            QR an der Tür scannen
          </Gs39Button>
        ) : null}
      </div>

      {toastMessage ? (
        <Gs39ToastLayer>
          <Gs39Toast message={toastMessage} icon="lock" />
        </Gs39ToastLayer>
      ) : null}
    </div>
  )
}
