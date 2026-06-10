import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HomeScreen } from '@/components/home/home-screen'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import { buildHubStations } from '@/lib/schoolhouse-hub-map'
import { getAllStations } from '@/lib/stations'

export const metadata: Metadata = {
  title: 'Schulnavigator — Stationen',
  description:
    'Schematischer Rundgang durch die Stationen der 39. Grundschule Dresden — Tag der offenen Tür.',
}

type PageProps = {
  searchParams: Promise<{ highlight?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const { highlight } = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_COOKIE)?.value
  const access = validateToken(token)
  const mode = access?.mode ?? 'heft'

  const stations = getAllStations()
  const hubStations = buildHubStations(stations)
  const validSlugs = stations.map((s) => s.slug)

  const highlightSlug =
    highlight && validSlugs.includes(highlight) ? highlight : undefined

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col overflow-x-hidden px-4 py-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <h1 id="hub-schoolhouse-title" className="sr-only">
        Stationen im Schulhaus
      </h1>
      <HomeScreen
        mode={mode}
        hubStations={hubStations}
        validSlugs={validSlugs}
        highlightSlug={highlightSlug}
      />
    </main>
  )
}
