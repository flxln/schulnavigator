'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { List, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { HighlightSlugSync } from '@/components/home/highlight-slug-sync'
import { SchoolhouseHub } from '@/components/schoolhouse/schoolhouse-hub'
import {
  FestiveDecor,
  Gs39Button,
  Gs39Card,
  Gs39Chip,
  Gs39Progress,
  SparkleBurst,
} from '@/components/ui'
import { isSparkleDone, markSparkleDone } from '@/lib/sparkle-done'
import type { EntryMode } from '@/lib/access-tokens'
import { useVisitedStations } from '@/hooks/use-visited-stations'
import { getUnlockedSlugsForMode, isHubFullyLocked } from '@/lib/hub-mode'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'
type HomeScreenProps = {
  mode: EntryMode
  hubStations: readonly IsometricHubStation[]
  validSlugs: readonly string[]
  highlightSlug?: string
}

function HubLoadingPlaceholder() {
  return (
    <div
      className="relative aspect-[800/520] min-h-[40vh] w-full rounded-[var(--r-md)] bg-bg-3"
      aria-busy="true"
      aria-label="Fortschritt wird geladen"
    />
  )
}

export function HomeScreen({
  mode,
  hubStations,
  validSlugs,
  highlightSlug,
}: HomeScreenProps) {
  const router = useRouter()
  const { visitedSlugs, visitedCount, isHydrated } =
    useVisitedStations(validSlugs)
  const [sparkleSuppressed, setSparkleSuppressed] = useState(() =>
    typeof window !== 'undefined' ? isSparkleDone() : true,
  )

  const showSparkle =
    isHydrated &&
    !sparkleSuppressed &&
    hubStations.length > 0 &&
    visitedCount === hubStations.length

  const stationSlugs = useMemo(
    () => hubStations.map((s) => s.slug),
    [hubStations],
  )

  const unlockedSlugs = useMemo(
    () => getUnlockedSlugsForMode(mode, stationSlugs, visitedSlugs),
    [mode, stationSlugs, visitedSlugs],
  )

  const showPlaceholder = !isHydrated && mode === 'fest'
  const allLocked =
    isHydrated && isHubFullyLocked(mode, unlockedSlugs, hubStations.length)

  const nextStation = useMemo(() => {
    if (visitedCount === 0 || visitedCount >= hubStations.length) {
      return null
    }
    return hubStations.find((s) => !visitedSlugs.has(s.slug)) ?? null
  }, [hubStations, visitedCount, visitedSlugs])

  const modeLabel =
    mode === 'heft'
      ? 'Schulstartheft · alles frei'
      : 'Schulfest · 26.06.2026'

  return (
    <div className="sn-fade-in flex flex-col gap-4">
      <HighlightSlugSync highlight={highlightSlug} />

      <div className="flex items-center gap-2.5 pt-1">
        <Gs39Chip tone="navy" size="sm">
          <span className="sn-brush text-lg leading-none tracking-wide">39</span>
        </Gs39Chip>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight text-fg-1">
            Schulnavigator
          </p>
          <p className="text-[11px] text-fg-3">{modeLabel}</p>
        </div>
        <Link
          href="/stationen"
          aria-label="Alle Stationen"
          className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-brand-navy/10 text-fg-1 transition-colors hover:bg-brand-navy/15"
        >
          <List size={20} aria-hidden />
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-[var(--r-lg)] bg-[#FBF8F0] px-4 pb-2 pt-3">
        <FestiveDecor />
        <div className="relative z-[1]">
          <h1 className="sn-brush text-[30px] leading-[0.95]">
            Entdecke
            <br />
            unsere <span className="sn-brush-hl">Schule</span>
          </h1>
          <p className="t-script mt-2 text-lg not-italic text-fg-2">
            {mode === 'heft'
              ? 'Tippen Sie auf einen Raum, um hineinzuschauen.'
              : 'Scannen Sie den QR an jeder Tür — Raum für Raum.'}
          </p>
        </div>

        <div className="relative z-[1] mt-2">
          {showPlaceholder ? (
            <HubLoadingPlaceholder />
          ) : (
            <SchoolhouseHub
              hubStations={hubStations}
              unlockedSlugs={unlockedSlugs}
              visitedSlugs={visitedSlugs}
              mode={mode}
              isHydrated={isHydrated}
              highlightSlug={highlightSlug}
              embedded
            />
          )}
        </div>
      </div>

      <Gs39Card className="relative p-4">
        {showSparkle ? (
          <SparkleBurst
            x="72%"
            y="28%"
            onDone={() => {
              markSparkleDone()
              setSparkleSuppressed(true)
            }}
          />
        ) : null}
        <Gs39Progress visited={visitedCount} total={hubStations.length} />
        <p className="mt-2 text-sm text-fg-3">
          {visitedCount === 0
            ? 'Noch keine Station entdeckt'
            : visitedCount === hubStations.length
              ? 'Alle Stationen entdeckt!'
              : 'Stationen entdeckt'}
        </p>
        {nextStation && visitedCount > 0 ? (
          <button
            type="button"
            onClick={() => router.push(`/raum/${nextStation.slug}`)}
            className="mt-3.5 flex w-full items-center gap-2.5 rounded-[var(--r-md)] border-0 bg-bg-3 p-3 text-left"
          >
            <Gs39Chip
              size="sm"
              className="!text-fg-on-dark"
              style={{ background: nextStation.accent }}
            >
              <span className="text-sm font-extrabold">{nextStation.nr}</span>
            </Gs39Chip>
            <span className="min-w-0 flex-1">
              <span className="t-eyebrow block text-[10px]">Vorschlag</span>
              <span className="block truncate text-sm font-bold text-fg-1">
                {nextStation.titel}
              </span>
            </span>
          </button>
        ) : null}
      </Gs39Card>

      {allLocked ? (
        <p
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-center text-sm text-fg-1"
          role="status"
        >
          Stationen sind gesperrt. Bitte scanne den QR-Code an der Raumtür.
        </p>
      ) : null}

      <Gs39Button
        block
        className="gap-2.5"
        onClick={() => router.push('/scan')}
      >
        <QrCode size={22} aria-hidden />
        QR an der Tür scannen
      </Gs39Button>

      <div className="sn-ribbon text-center text-xl">
        Gemeinsam feiern. Erinnern. Zukunft gestalten.
      </div>

      <p className="pb-1 text-center text-[11px] text-fg-3">
        150 Jahre 39. Grundschule · 26.06.2026
      </p>
    </div>
  )
}
