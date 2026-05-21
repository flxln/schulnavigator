'use client'

import Link from 'next/link'
import { startTransition, useEffect, useMemo, useState } from 'react'
import type { SchoolhouseSegment } from '@/lib/schoolhouse-segments'
import type { HubUnlockMode } from '@/lib/hub-unlock-stub'
import { getUnlockedSegmentIds } from '@/lib/hub-unlock-stub'
import { HubDevUnlockToggle } from '@/components/schoolhouse/hub-dev-unlock-toggle'
import { ScanCta } from '@/components/schoolhouse/scan-cta'
import { SchoolhouseSrNav } from '@/components/schoolhouse/schoolhouse-sr-nav'
import { SchoolhouseSvg } from '@/components/schoolhouse/schoolhouse-svg'

const SESSION_KEY = 'hub-dev-unlock-mode'

type SchoolhouseHubProps = {
  segments: readonly SchoolhouseSegment[]
}

function pct(value: number, total: number): string {
  return `${(value / total) * 100}%`
}

export function SchoolhouseHub({ segments }: SchoolhouseHubProps) {
  const allIds = useMemo(
    () => segments.map((s) => s.puzzleSegmentId),
    [segments],
  )

  const [unlockMode, setUnlockMode] = useState<HubUnlockMode>('all-unlocked')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return
    }
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === 'all-locked' || stored === 'all-unlocked') {
      startTransition(() => {
        setUnlockMode(stored)
      })
    }
  }, [])

  const unlockedSegmentIds = useMemo(
    () => getUnlockedSegmentIds(unlockMode, allIds),
    [unlockMode, allIds],
  )

  const handleUnlockChange = (mode: HubUnlockMode) => {
    setUnlockMode(mode)
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.setItem(SESSION_KEY, mode)
    }
  }

  const allLocked = unlockMode === 'all-locked'

  return (
    <div className="flex flex-col gap-6">
      <SchoolhouseSrNav
        segments={segments}
        unlockedSegmentIds={unlockedSegmentIds}
      />
      <div className="relative w-full aspect-[2/3] min-h-[50vh] max-h-[85vh]">
        <div className="absolute inset-0">
          <SchoolhouseSvg
            segments={segments}
            unlockedSegmentIds={unlockedSegmentIds}
          />
        </div>
        {!allLocked &&
          segments.map((s) => {
            if (!unlockedSegmentIds.has(s.puzzleSegmentId)) {
              return null
            }
            return (
              <Link
                key={s.slug}
                href={`/raum/${s.slug}`}
                className="absolute z-10 block rounded-lg ring-2 ring-transparent focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                style={{
                  left: pct(s.x, 400),
                  top: pct(s.y, 600),
                  width: pct(s.width, 400),
                  height: pct(s.height, 600),
                }}
                aria-label={`${s.titel} öffnen`}
              >
                <span className="sr-only">{s.titel}</span>
              </Link>
            )
          })}
      </div>
      {allLocked ? (
        <p
          className="rounded-lg bg-zinc-100 px-3 py-2 text-center text-sm text-zinc-800"
          role="status"
        >
          Stationen sind gesperrt. Bitte scanne den QR-Code an der Raumtür
          (Vorschau Schulfest-Modus).
        </p>
      ) : null}
      <ScanCta />
      <HubDevUnlockToggle mode={unlockMode} onChange={handleUnlockChange} />
    </div>
  )
}
