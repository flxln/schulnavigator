import Link from 'next/link'
import { isHubStationNavigable } from '@/lib/hub-mode'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type SchoolhouseSrNavProps = {
  hubStations: readonly HubStation[]
  unlockedSlugs: ReadonlySet<string>
}

export function SchoolhouseSrNav({
  hubStations,
  unlockedSlugs,
}: SchoolhouseSrNavProps) {
  return (
    <nav aria-label="Alle Stationen" className="sr-only">
      <ul>
        {hubStations.map((s) => {
          const unlocked = isHubStationNavigable(s.slug, unlockedSlugs)
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
