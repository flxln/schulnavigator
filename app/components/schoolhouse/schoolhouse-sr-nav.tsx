import Link from 'next/link'
import type { SchoolhouseSegment } from '@/lib/schoolhouse-segments'

type SchoolhouseSrNavProps = {
  segments: readonly SchoolhouseSegment[]
  unlockedSegmentIds: ReadonlySet<string>
}

export function SchoolhouseSrNav({
  segments,
  unlockedSegmentIds,
}: SchoolhouseSrNavProps) {
  return (
    <nav aria-label="Alle Stationen" className="sr-only">
      <ul>
        {segments.map((s) => {
          const unlocked = unlockedSegmentIds.has(s.puzzleSegmentId)
          return (
            <li key={s.slug}>
              {unlocked ? (
                <Link href={`/raum/${s.slug}`}>{`${s.titel} öffnen`}</Link>
              ) : (
                <span aria-disabled="true">{`${s.titel} (gesperrt)`}</span>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
