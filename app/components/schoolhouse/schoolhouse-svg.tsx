import type { SchoolhouseSegment } from '@/lib/schoolhouse-segments'
import { ENTRANCE_CELL, SCHOOLHOUSE_VIEWBOX } from '@/lib/schoolhouse-layout'

type SchoolhouseSvgProps = {
  segments: readonly SchoolhouseSegment[]
  unlockedSegmentIds: ReadonlySet<string>
}

export function SchoolhouseSvg({
  segments,
  unlockedSegmentIds,
}: SchoolhouseSvgProps) {
  return (
    <svg
      viewBox={SCHOOLHOUSE_VIEWBOX}
      className="h-full w-full text-zinc-900"
      role="group"
      aria-labelledby="hub-schoolhouse-title"
    >
      <rect
        x={ENTRANCE_CELL.x}
        y={ENTRANCE_CELL.y}
        width={ENTRANCE_CELL.width}
        height={ENTRANCE_CELL.height}
        rx={10}
        className="fill-zinc-100 stroke-zinc-300"
        strokeWidth={1}
        pointerEvents="none"
      />
      <text
        x={ENTRANCE_CELL.x + ENTRANCE_CELL.width / 2}
        y={ENTRANCE_CELL.y + ENTRANCE_CELL.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-zinc-500"
        style={{ fontSize: 11 }}
        pointerEvents="none"
      >
        Eingang
      </text>
      {segments.map((s) => {
        const unlocked = unlockedSegmentIds.has(s.puzzleSegmentId)
        const label = s.labelShort ?? s.label
        return (
          <g key={s.puzzleSegmentId} id={s.puzzleSegmentId}>
            <rect
              x={s.x}
              y={s.y}
              width={s.width}
              height={s.height}
              rx={s.rx}
              strokeWidth={2}
              pointerEvents="none"
              className={
                unlocked
                  ? 'fill-emerald-100 stroke-emerald-700'
                  : 'fill-zinc-200 stroke-zinc-400 opacity-60'
              }
            />
            <text
              x={s.x + s.width / 2}
              y={s.y + s.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className={unlocked ? 'fill-zinc-900' : 'fill-zinc-600'}
              style={{ fontSize: 10 }}
              pointerEvents="none"
              {...(label.length > 12
                ? {
                    textLength: Math.min(s.width * 0.85, 110),
                    lengthAdjust: 'spacingAndGlyphs' as const,
                  }
                : {})}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
