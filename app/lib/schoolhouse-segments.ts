import type { Station } from '@/lib/types'
import { getSegmentGeometry, SEGMENT_GEOMETRY } from '@/lib/schoolhouse-layout'

export type SchoolhouseSegment = {
  puzzleSegmentId: string
  slug: string
  label: string
  labelShort?: string
  titel: string
  x: number
  y: number
  width: number
  height: number
  rx: number
}

const DEFAULT_RX = 10

export function buildSchoolhouseSegments(
  stations: readonly Station[],
): readonly SchoolhouseSegment[] {
  const byPuzzleId = new Map(
    stations.map((s) => [s.puzzleSegmentId, s] as const),
  )
  const out: SchoolhouseSegment[] = []
  for (const geo of SEGMENT_GEOMETRY) {
    const station = byPuzzleId.get(geo.id)
    if (!station) {
      throw new Error(
        `schoolhouse: keine Station für puzzleSegmentId "${geo.id}"`,
      )
    }
    const layout = getSegmentGeometry(geo.id)
    if (!layout) {
      throw new Error(`schoolhouse: unbekannte Geometrie "${geo.id}"`)
    }
    out.push({
      puzzleSegmentId: geo.id,
      slug: station.slug,
      label: geo.label,
      labelShort: geo.labelShort,
      titel: station.titel,
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
      rx: DEFAULT_RX,
    })
  }
  if (stations.length !== SEGMENT_GEOMETRY.length) {
    throw new Error(
      `schoolhouse: erwartet ${SEGMENT_GEOMETRY.length} Stationen, erhalten ${stations.length}`,
    )
  }
  const geoIds = new Set(SEGMENT_GEOMETRY.map((g) => g.id))
  for (const st of stations) {
    if (!geoIds.has(st.puzzleSegmentId)) {
      throw new Error(
        `schoolhouse: Station "${st.slug}" hat unbekanntes puzzleSegmentId "${st.puzzleSegmentId}"`,
      )
    }
  }
  return out
}
