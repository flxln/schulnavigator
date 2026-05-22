import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { HubProgress } from '@/components/schoolhouse/hub-progress'
import { SchoolhouseHub } from '@/components/schoolhouse/schoolhouse-hub'
import { ACCESS_COOKIE, validateToken } from '@/lib/access-tokens'
import { buildSchoolhouseSegments } from '@/lib/schoolhouse-segments'
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

  const segments = buildSchoolhouseSegments(getAllStations())

  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 overflow-x-hidden px-4 py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-fg-1">Schulnavigator</h1>
        <p className="text-sm leading-relaxed text-fg-2">
          Wähle eine Station im Schulhaus oder scanne den QR-Code an der Tür.
        </p>
      </header>
      <HubProgress visited={0} total={11} />
      <h2 id="hub-schoolhouse-title" className="sr-only">
        Stationen im Schulhaus
      </h2>
      <SchoolhouseHub segments={segments} mode={mode} />
    </main>
  )
}
