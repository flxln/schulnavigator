'use client'

import type { EntryMode } from '@/lib/access-tokens'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import { expandHitRect } from '@/lib/schoolhouse-hub-hit'
import { StationIcon } from '@/components/station/station-icon'
import {
  HUB_VIEWBOX,
  listHubStationFrames,
  type HubStation,
} from '@/lib/schoolhouse-hub-map'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

const LOCKED_GLASS = 'rgba(20, 30, 50, 0.18)'
const FRAME_LOCKED = 'rgba(255,255,255,.55)'

const STATION_CHIP = {
  rLocked: 18,
  rVisited: 19,
  stroke: 2,
  insetX: 8,
  insetY: 8,
  offsetX: 3,
  offsetY: -3,
} as const

type FrontSchoolhouseProps = {
  stations: readonly HubStation[]
  visitedSlugs: ReadonlySet<string>
  unlockedSlugs: ReadonlySet<string>
  highlightSlug?: string
  mode: EntryMode
  isHydrated?: boolean
  onStationTap: (slug: string) => void
  className?: string
}

function handleStationKeyDown(
  event: KeyboardEvent<SVGGElement>,
  onActivate: () => void,
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onActivate()
  }
}

function stationAriaLabel(
  station: HubStation,
  visited: boolean,
  stationCount: number,
) {
  const status = visited ? 'besucht' : 'noch nicht besucht'
  return `${station.titel}, Raum ${station.nr} von ${stationCount}, ${status}`
}

function StationChip({
  x,
  y,
  station,
  visited,
}: {
  x: number
  y: number
  station: HubStation
  visited: boolean
}) {
  const cx = x + STATION_CHIP.offsetX
  const cy = y + STATION_CHIP.offsetY

  if (visited) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={STATION_CHIP.rVisited}
          fill={station.accent}
          stroke={GS39_BRAND_HEX.paper}
          strokeWidth={STATION_CHIP.stroke}
        />
        <path
          d={`M ${cx - 7} ${cy} L ${cx - 2} ${cy + 6} L ${cx + 7} ${cy - 6}`}
          fill="none"
          stroke="#fff"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    )
  }
  return (
    <g opacity={0.85}>
      <circle
        cx={cx}
        cy={cy}
        r={STATION_CHIP.rLocked}
        fill="rgba(255,255,255,.95)"
        stroke="rgba(8,42,80,.35)"
        strokeWidth={1.2}
      />
      <StationIcon
        slug={station.slug}
        size={26}
        visited={false}
        accent={station.accent}
        variant="svg-nested"
        cx={cx}
        cy={cy}
      />
    </g>
  )
}

type StationSlotProps = {
  station: HubStation
  visited: boolean
  highlighted: boolean
  hitRect: readonly [number, number, number, number]
  stationCount: number
  onTap: (slug: string) => void
}

function StationSlot({
  station,
  visited,
  highlighted,
  hitRect,
  stationCount,
  onTap,
}: StationSlotProps) {
  const [x, y, w, h] = station.frame
  const [hx, hy, hw, hh] = hitRect
  const isPortal = station.kind === 'portal'
  const glassFill = visited ? station.visitedGlassFill : LOCKED_GLASS
  const frameStroke = visited ? station.accent : FRAME_LOCKED
  const chipX = x + w - STATION_CHIP.insetX
  const chipY = y + STATION_CHIP.insetY
  const activate = () => onTap(station.slug)

  return (
    <g
      className={highlighted ? 'sh-window sh-window--pop' : 'sh-window'}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={stationAriaLabel(station, visited, stationCount)}
      onClick={activate}
      onKeyDown={(e) => handleStationKeyDown(e, activate)}
    >
      <rect x={hx} y={hy} width={hw} height={hh} fill="transparent" />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={glassFill}
        stroke={frameStroke}
        strokeWidth={isPortal ? 3.5 : 2.5}
        rx={isPortal ? 4 : 2}
      />
      {station.kind === 'fenster' ? (
        <>
          <line
            x1={x + w / 2}
            y1={y}
            x2={x + w / 2}
            y2={y + h}
            stroke={frameStroke}
            strokeWidth={1.5}
          />
          <line
            x1={x}
            y1={y + h / 2}
            x2={x + w}
            y2={y + h / 2}
            stroke={frameStroke}
            strokeWidth={1.5}
          />
        </>
      ) : null}
      {visited ? (
        <polygon
          points={`${x + 6},${y + 6} ${x + w / 2 - 4},${y + 6} ${x + w / 2 - 4},${y + 14} ${x + 20},${y + h / 2 - 4} ${x + 6},${y + h / 2 - 4}`}
          fill="rgba(255,255,255,.45)"
        />
      ) : null}
      <StationChip x={chipX} y={chipY} station={station} visited={visited} />
    </g>
  )
}

export function FrontSchoolhouse({
  stations,
  visitedSlugs,
  unlockedSlugs,
  highlightSlug,
  isHydrated = true,
  onStationTap,
  className = '',
}: FrontSchoolhouseProps) {
  const router = useRouter()
  const svgRef = useRef<SVGSVGElement>(null)
  const [pxPerUnit, setPxPerUnit] = useState(
    () => 390 / HUB_VIEWBOX.w,
  )
  const effectiveVisited = isHydrated ? visitedSlugs : new Set<string>()

  useEffect(() => {
    for (const station of stations) {
      if (unlockedSlugs.has(station.slug)) {
        router.prefetch(`/raum/${station.slug}`)
      }
    }
  }, [stations, unlockedSlugs, router])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return

    const update = () => {
      const width = el.getBoundingClientRect().width
      if (width > 0) {
        setPxPerUnit(width / HUB_VIEWBOX.w)
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const allFrames = listHubStationFrames(stations)
  const isVisited = (slug: string) => effectiveVisited.has(slug)
  const isHighlighted = (slug: string) => highlightSlug === slug

  const handleTap = (slug: string) => {
    onStationTap(slug)
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${HUB_VIEWBOX.w} ${HUB_VIEWBOX.h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={`block h-auto w-full ${className}`.trim()}
      role="img"
      aria-label="Schulgebäude der 39. GS mit klickbaren Stationen"
    >
      <image
        href="/brand/hub/gs39-front-outline.svg"
        x={0}
        y={0}
        width={HUB_VIEWBOX.w}
        height={HUB_VIEWBOX.h}
        preserveAspectRatio="xMidYMid meet"
      />
      {stations.map((station, index) => {
        const neighbors = allFrames.filter((_, j) => j !== index)
        const hitRect = expandHitRect(station.frame, neighbors, pxPerUnit)
        return (
          <StationSlot
            key={station.slug}
            station={station}
            visited={isVisited(station.slug)}
            highlighted={isHighlighted(station.slug)}
            hitRect={hitRect}
            stationCount={stations.length}
            onTap={handleTap}
          />
        )
      })}
    </svg>
  )
}
