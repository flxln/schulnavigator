import { CoachPanel } from '@/components/mpz-studio/coach-panel'
import { createMpzContentIo } from '@/lib/mpz-content-io'

export default async function MpzStudioCoachPage() {
  const io = createMpzContentIo()
  const [coachFile, stationsFile] = await Promise.all([
    io.readCoachMessages(),
    io.readStations(),
  ])
  const stationSlugs = stationsFile.stations.map((s) => s.slug)

  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <CoachPanel
          messages={coachFile.messages}
          stationSlugs={stationSlugs}
          stationCount={stationSlugs.length}
        />
      </section>
    </div>
  )
}
