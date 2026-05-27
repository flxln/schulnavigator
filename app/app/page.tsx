import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HubWithProgress } from '@/components/schoolhouse/hub-with-progress'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import { buildIsometricHubStations } from '@/lib/schoolhouse-isometric-map'
import { getAllStations } from '@/lib/stations'

export const metadata: Metadata = {
  title: 'Schulnavigator — Stationen',
  description:
    'Schematischer Rundgang durch die Stationen der 39. Grundschule Dresden — Tag der offenen Tür.',
}

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  const access = validateToken(token)
  const mode = access?.mode ?? 'heft'

  const stations = getAllStations()
  const hubStations = buildIsometricHubStations(stations)
  const validSlugs = stations.map((s) => s.slug)

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 overflow-x-hidden px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-fg-1">Schulnavigator</h1>
        <p className="text-sm leading-relaxed text-fg-2">
          Wähle eine Station im Schulhaus oder scanne den QR-Code an der Tür.
        </p>
      </header>
      <h2 id="hub-schoolhouse-title" className="sr-only">
        Stationen im Schulhaus
      </h2>
      <HubWithProgress
        mode={mode}
        hubStations={hubStations}
        validSlugs={validSlugs}
      />
    </main>
  )
}
