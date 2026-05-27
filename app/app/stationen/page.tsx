import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { StationenScreen } from '@/components/stationen/stationen-screen'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import { buildIsometricHubStations } from '@/lib/schoolhouse-isometric-map'
import { getAllStations } from '@/lib/stations'

export const metadata: Metadata = {
  title: 'Alle Stationen — Schulnavigator',
  description:
    'Übersicht aller Stationen der 39. Grundschule Dresden — Tag der offenen Tür.',
}

export default async function StationenPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  const access = validateToken(token)
  const mode = access?.mode ?? 'heft'

  const stations = getAllStations()
  const hubStations = buildIsometricHubStations(stations)
  const validSlugs = stations.map((s) => s.slug)

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col overflow-x-hidden bg-bg-1">
      <StationenScreen
        mode={mode}
        hubStations={hubStations}
        validSlugs={validSlugs}
      />
    </main>
  )
}
