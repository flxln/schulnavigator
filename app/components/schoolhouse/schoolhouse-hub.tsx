'use client'

import Link from 'next/link'
import type { SchoolhouseSegment } from '@/lib/schoolhouse-segments'
import { ScanCta } from '@/components/schoolhouse/scan-cta'
import { SchoolhouseSrNav } from '@/components/schoolhouse/schoolhouse-sr-nav'
import { SchoolhouseSvg } from '@/components/schoolhouse/schoolhouse-svg'

type SchoolhouseHubProps = {
  segments: readonly SchoolhouseSegment[]
  unlockedSegmentIds: ReadonlySet<string>
}

function pct(value: number, total: number): string {
  return `${(value / total) * 100}%`
}

export function SchoolhouseHub({
  segments,
  unlockedSegmentIds,
}: SchoolhouseHubProps) {
  const allLocked =
    segments.length > 0 && unlockedSegmentIds.size === 0

  return (
    <div className="flex flex-col gap-6">
      <SchoolhouseSrNav
        segments={segments}
        unlockedSegmentIds={unlockedSegmentIds}
      />
      <div className="relative aspect-[2/3] min-h-[50vh] max-h-[85vh] w-full">
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
                className="absolute z-10 block rounded-[var(--r-md)] ring-2 ring-transparent focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-2"
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
          className="rounded-[var(--r-md)] bg-bg-3 px-3 py-2 text-center text-sm text-fg-1"
          role="status"
        >
          Stationen sind gesperrt. Bitte scanne den QR-Code an der Raumtür.
        </p>
      ) : null}
      <ScanCta />
    </div>
  )
}
