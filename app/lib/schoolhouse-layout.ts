export const SCHOOLHOUSE_VIEWBOX = '0 0 400 600' as const

const CW = 400 / 3
const RH = 150

export type SegmentGeometry = {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  labelShort?: string
}

export const ENTRANCE_CELL = {
  x: 2 * CW,
  y: 3 * RH,
  width: CW,
  height: RH,
} as const

export const SEGMENT_GEOMETRY: readonly SegmentGeometry[] = [
  { id: 'seg-10', x: 0, y: 0, width: CW, height: RH, label: 'Musik' },
  { id: 'seg-07', x: CW, y: 0, width: CW, height: RH, label: 'Kunst' },
  { id: 'seg-08', x: 2 * CW, y: 0, width: CW, height: RH, label: 'Lesewelt' },
  { id: 'seg-01', x: 0, y: RH, width: CW, height: RH, label: 'Klassenzimmer' },
  { id: 'seg-02', x: CW, y: RH, width: CW, height: RH, label: 'DaZ' },
  { id: 'seg-03', x: 2 * CW, y: RH, width: CW, height: RH, label: 'PC-Raum' },
  { id: 'seg-04', x: 0, y: 2 * RH, width: CW, height: RH, label: 'Werken' },
  { id: 'seg-05', x: CW, y: 2 * RH, width: CW, height: RH, label: 'Turnhalle' },
  {
    id: 'seg-06',
    x: 2 * CW,
    y: 2 * RH,
    width: CW,
    height: RH,
    label: 'Speiseraum',
  },
  { id: 'seg-09', x: 0, y: 3 * RH, width: CW, height: RH, label: 'Hort' },
  {
    id: 'seg-11',
    x: CW,
    y: 3 * RH,
    width: CW,
    height: RH,
    label: 'Schulsozialarbeit',
    labelShort: 'Sozialarbeit',
  },
]

export const EXPECTED_SEGMENT_IDS: readonly string[] = SEGMENT_GEOMETRY.map(
  (g) => g.id,
)

export const EXPECTED_SEGMENT_ID_SET = new Set<string>(EXPECTED_SEGMENT_IDS)

const geometryById = new Map(SEGMENT_GEOMETRY.map((g) => [g.id, g] as const))

export function getSegmentGeometry(id: string): SegmentGeometry | undefined {
  return geometryById.get(id)
}
