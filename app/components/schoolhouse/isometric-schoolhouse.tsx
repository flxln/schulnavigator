'use client'

import type { EntryMode } from '@/lib/access-tokens'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'
import {
  ISOMETRIC_ROOM_FRAMES,
  isIsometricWindowRoom,
  type IsometricHubStation,
  type IsometricWindowRoom,
} from '@/lib/schoolhouse-isometric-map'
import { useRouter } from 'next/navigation'
import { useEffect, type KeyboardEvent } from 'react'

const MIN_HIT_PX = 44
const LOCKED_GLASS = 'rgba(20, 30, 50, 0.18)'
const FRAME_LOCKED = 'rgba(255,255,255,.55)'

/** Stationsnummern-Kreis — skaliert zum vergrößerten Fenster-Layout (78×82). */
const STATION_CHIP = {
  rLocked: 16,
  rVisited: 17,
  fontSize: 15,
  stroke: 2,
  insetX: 10,
  insetY: 10,
  offsetX: 3,
  offsetY: -3,
} as const

type IsometricSchoolhouseProps = {
  stations: readonly IsometricHubStation[]
  visitedSlugs: ReadonlySet<string>
  unlockedSlugs: ReadonlySet<string>
  highlightSlug?: string
  mode: EntryMode
  isHydrated?: boolean
  onStationTap: (slug: string) => void
  className?: string
}

function expandHitRect(
  x: number,
  y: number,
  w: number,
  h: number,
  min = MIN_HIT_PX,
): [number, number, number, number] {
  const width = Math.max(w, min)
  const height = Math.max(h, min)
  const left = x - (width - w) / 2
  const top = y - (height - h) / 2
  return [left, top, width, height]
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

function stationAriaLabel(station: IsometricHubStation, visited: boolean) {
  const status = visited ? 'besucht' : 'noch nicht besucht'
  return `${station.titel}, Station ${station.nr}, ${status}`
}

type StationWindowProps = {
  station: IsometricHubStation
  visited: boolean
  highlighted: boolean
  onTap: (slug: string) => void
}

function StationWindow({
  station,
  visited,
  highlighted,
  onTap,
}: StationWindowProps) {
  const room = station.room as IsometricWindowRoom
  const [x, y, w, h] = ISOMETRIC_ROOM_FRAMES[room]
  const isEntrance = room === 'ground-mid'
  const [hx, hy, hw, hh] = expandHitRect(x - 6, y - 6, w + 12, h + 12)
  const accent = station.accent
  const glassFill = visited ? station.visitedGlassFill : LOCKED_GLASS
  const frameStroke = visited ? accent : FRAME_LOCKED
  const chipX = x + w - STATION_CHIP.insetX
  const chipY = y + STATION_CHIP.insetY
  const archDepth = h * (60.59 / 81.56)
  const archRise = 20.2 * (w / 78.33)

  const activate = () => onTap(station.slug)

  return (
    <g
      className={highlighted ? 'sh-window sh-window--pop' : 'sh-window'}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={stationAriaLabel(station, visited)}
      onClick={activate}
      onKeyDown={(e) => handleStationKeyDown(e, activate)}
    >
      <rect x={hx} y={hy} width={hw} height={hh} fill="transparent" />

      {isEntrance ? (
        <g>
          <path
            d={`M ${x} ${y + h} v-${archDepth} c ${w * 0.333} -${archRise} ${w * 0.667} -${archRise} ${w} 0 v${archDepth} H ${x} Z`}
            fill={visited ? station.visitedDoorFill : '#2a2a35'}
            stroke={frameStroke}
            strokeWidth={2.5}
          />
          <line
            x1={x + w / 2}
            y1={y + h * 0.17}
            x2={x + w / 2}
            y2={y + h}
            stroke={frameStroke}
            strokeWidth={1.5}
          />
          <circle
            cx={x + w * 0.405}
            cy={y + h * 0.7}
            r={2.1}
            fill={GS39_BRAND_HEX.sun}
          />
          <circle
            cx={x + w * 0.575}
            cy={y + h * 0.7}
            r={2.1}
            fill={GS39_BRAND_HEX.sun}
          />
          <rect x={x - 8} y={y + h} width={w + 16} height={7} fill="#cfc6b3" />
          <rect x={x - 13} y={y + h + 7} width={w + 26} height={5} fill="#bcb29c" />
        </g>
      ) : (
        <g>
          <rect x={x - 5} y={y + h - 2} width={w + 10} height={6} fill="#b9a98c" />
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={glassFill}
            stroke={frameStroke}
            strokeWidth={2.5}
          />
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
          {visited ? (
            <polygon
              points={`${x + 4},${y + 4} ${x + w / 2 - 4},${y + 4} ${x + w / 2 - 4},${y + 10} ${x + 16},${y + h / 2 - 4} ${x + 4},${y + h / 2 - 4}`}
              fill="rgba(255,255,255,.45)"
            />
          ) : null}
        </g>
      )}

      <StationChip x={chipX} y={chipY} station={station} visited={visited} />
    </g>
  )
}

function StationChip({
  x,
  y,
  station,
  visited,
}: {
  x: number
  y: number
  station: IsometricHubStation
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
      <text
        x={cx}
        y={cy + 5.5}
        textAnchor="middle"
        fontFamily="var(--font-ui)"
        fontSize={STATION_CHIP.fontSize}
        fontWeight={800}
        fill={GS39_BRAND_HEX.navy}
      >
        {station.nr}
      </text>
    </g>
  )
}

type GymBuildingProps = {
  station: IsometricHubStation
  visited: boolean
  highlighted: boolean
  onTap: (slug: string) => void
}

function GymBuilding({ station, visited, highlighted, onTap }: GymBuildingProps) {
  const accent = station.accent
  const wallFill = visited ? GS39_BRAND_HEX.paper50 : '#E1DDD2'
  const [hx, hy, hw, hh] = expandHitRect(575, 235, 200, 170)
  const activate = () => onTap(station.slug)

  return (
    <g
      className={highlighted ? 'sh-window sh-window--pop' : 'sh-window'}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={stationAriaLabel(station, visited)}
      onClick={activate}
      onKeyDown={(e) => handleStationKeyDown(e, activate)}
    >
      <rect x={hx} y={hy} width={hw} height={hh} fill="transparent" />
      <polygon
        points="760,250 778,238 778,388 760,395"
        fill={visited ? '#D9D2BE' : '#C7C0AB'}
      />
      <polygon
        points="580,250 760,250 778,238 598,238"
        fill={visited ? GS39_BRAND_HEX.navy700 : '#3E4A5E'}
      />
      <rect
        x={580}
        y={250}
        width={180}
        height={145}
        fill={wallFill}
        stroke="rgba(8,42,80,.2)"
        strokeWidth={1}
      />
      <rect
        x={580}
        y={310}
        width={180}
        height={3}
        fill="rgba(8,42,80,.12)"
      />
      {[610, 660, 710].map((wx, i) => (
        <g key={i}>
          <rect
            x={wx}
            y={264}
            width={30}
            height={36}
            fill={visited ? station.visitedGymGlassFill : LOCKED_GLASS}
            stroke={visited ? accent : FRAME_LOCKED}
            strokeWidth={1.6}
          />
          <line
            x1={wx + 15}
            y1={264}
            x2={wx + 15}
            y2={300}
            stroke={visited ? accent : FRAME_LOCKED}
            strokeWidth={1}
          />
          <line
            x1={wx}
            y1={282}
            x2={wx + 30}
            y2={282}
            stroke={visited ? accent : FRAME_LOCKED}
            strokeWidth={1}
          />
        </g>
      ))}
      <rect
        x={655}
        y={335}
        width={32}
        height={58}
        fill="#2a2a35"
        stroke={visited ? accent : FRAME_LOCKED}
        strokeWidth={2}
      />
      <line
        x1={671}
        y1={335}
        x2={671}
        y2={393}
        stroke={visited ? accent : FRAME_LOCKED}
        strokeWidth={1}
      />
      <rect
        x={605}
        y={320}
        width={48}
        height={12}
        rx={2}
        fill={visited ? GS39_BRAND_HEX.navy : 'rgba(60,70,90,.6)'}
      />
      <text
        x={629}
        y={329}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={11}
        fontWeight={800}
        fill={GS39_BRAND_HEX.white}
        letterSpacing={0.5}
      >
        SPORT
      </text>
      <rect
        x={697}
        y={320}
        width={48}
        height={12}
        rx={2}
        fill={visited ? GS39_BRAND_HEX.navy : 'rgba(60,70,90,.6)'}
      />
      <text
        x={721}
        y={329}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={11}
        fontWeight={800}
        fill={GS39_BRAND_HEX.white}
        letterSpacing={0.5}
      >
        HALLE
      </text>
      <StationChip x={770} y={250} station={station} visited={visited} />
    </g>
  )
}

type GardenPatchProps = {
  station: IsometricHubStation
  visited: boolean
  highlighted: boolean
  onTap: (slug: string) => void
}

function GardenPatch({ station, visited, highlighted, onTap }: GardenPatchProps) {
  const [hx, hy, hw, hh] = expandHitRect(521, 389, 206, 48)
  const activate = () => onTap(station.slug)

  return (
    <g
      className={highlighted ? 'sh-window sh-window--pop' : 'sh-window'}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={stationAriaLabel(station, visited)}
      onClick={activate}
      onKeyDown={(e) => handleStationKeyDown(e, activate)}
    >
      <rect x={hx} y={hy} width={hw} height={hh} fill="transparent" />
      <polygon
        points="521.5,416.16 676.5,436.16 726.5,408.16 566.5,391.16"
        fill={visited ? '#7BAE5A' : '#9aa18f'}
        stroke={visited ? GS39_BRAND_HEX.green700 : 'rgba(8,42,80,.25)'}
        strokeWidth={1.5}
      />
      {[
        { p: '551.5,408.16 621.5,416.16 631.5,408.16 566.5,401.16', soil: '#6b4a2a' },
        { p: '581.5,396.16 654.5,403.16 666.5,395.16 596.5,389.16', soil: '#7a5530' },
      ].map((bed, i) => (
        <g key={i}>
          <polygon
            points={bed.p}
            fill={visited ? bed.soil : '#8a8478'}
            stroke="#3d2814"
            strokeWidth={1}
          />
          {visited ? (
            <>
              <circle
                cx={566 + i * 30}
                cy={403 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
              <circle
                cx={586 + i * 30}
                cy={405 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
              <circle
                cx={606 + i * 30}
                cy={407 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
            </>
          ) : null}
        </g>
      ))}
      {visited ? (
        <g transform="translate(536, 388)">
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={42}
            stroke={GS39_BRAND_HEX.green700}
            strokeWidth={2.5}
          />
          <circle cx={0} cy={0} r={8} fill={GS39_BRAND_HEX.sun} />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-6}
              rx={3}
              ry={5}
              transform={`rotate(${angle})`}
              fill={GS39_BRAND_HEX.sun}
            />
          ))}
          <circle cx={0} cy={0} r={3.5} fill={GS39_BRAND_HEX.navy} />
        </g>
      ) : null}
      <line x1={521.5} y1={416.16} x2={526.5} y2={436.16} stroke="#5e4a2e" strokeWidth={2} />
      <line x1={586.5} y1={420.16} x2={588.5} y2={438.16} stroke="#5e4a2e" strokeWidth={2} />
      <line x1={651.5} y1={428.16} x2={652.5} y2={440.16} stroke="#5e4a2e" strokeWidth={2} />
      <line
        x1={521.5}
        y1={424.16}
        x2={676.5}
        y2={440.16}
        stroke="#5e4a2e"
        strokeWidth={1.5}
      />
      <StationChip x={714.5} y={396.16} station={station} visited={visited} />
    </g>
  )
}

export function IsometricSchoolhouse({
  stations,
  visitedSlugs,
  unlockedSlugs,
  highlightSlug,
  mode,
  isHydrated = true,
  onStationTap,
  className = '',
}: IsometricSchoolhouseProps) {
  const router = useRouter()
  const effectiveVisited = isHydrated ? visitedSlugs : new Set<string>()

  useEffect(() => {
    for (const station of stations) {
      if (unlockedSlugs.has(station.slug)) {
        router.prefetch(`/raum/${station.slug}`)
      }
    }
  }, [stations, unlockedSlugs, router])

  const inside = stations.filter((s) => isIsometricWindowRoom(s.room))
  const gym = stations.find((s) => s.room === 'gym')
  const garden = stations.find((s) => s.room === 'garden')

  const isVisited = (slug: string) => effectiveVisited.has(slug)
  const isHighlighted = (slug: string) => highlightSlug === slug

  const handleTap = (slug: string) => {
    if (mode === 'fest' && !unlockedSlugs.has(slug)) {
      onStationTap(slug)
      return
    }
    onStationTap(slug)
  }

  return (
    <svg
      viewBox="0 0 800 520"
      xmlns="http://www.w3.org/2000/svg"
      className={`block h-auto w-full ${className}`.trim()}
      role="img"
      aria-label="Isometrisches Schulhaus mit klickbaren Stationen"
    >
      <defs>
        <linearGradient id="sh-wall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFFDF6" />
          <stop offset="1" stopColor="#F1ECDD" />
        </linearGradient>
        <linearGradient id="sh-rightwall" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#E8E2CF" />
          <stop offset="1" stopColor="#D6CFB7" />
        </linearGradient>
        <linearGradient id="sh-roof" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#082A50" />
          <stop offset="1" stopColor="#13396a" />
        </linearGradient>
      </defs>

      <ellipse cx={400} cy={485} rx={380} ry={32} fill="#E8E0CB" opacity={0.7} />
      <rect x={0} y={460} width={800} height={60} fill="rgba(199,188,158,.35)" />

      {gym ? (
        <GymBuilding
          station={gym}
          visited={isVisited(gym.slug)}
          highlighted={isHighlighted(gym.slug)}
          onTap={handleTap}
        />
      ) : null}

      <polygon
        points="467.18,108.94 569,71.66 569,411.89 467.18,429.37"
        fill="url(#sh-rightwall)"
        stroke="rgba(8,42,80,.25)"
        strokeWidth={1.2}
      />
      <polygon
        points="467.18,108.94 569,71.66 456.73,9.9 271.36,41.36"
        fill="url(#sh-roof)"
        stroke="#06203d"
        strokeWidth={1.2}
      />
      <polygon
        points="49.44,108.94 271.36,41.36 467.18,108.94"
        fill="url(#sh-roof)"
        stroke="#06203d"
        strokeWidth={1.2}
      />
      <polygon
        points="62.5,108.94 258.31,48.35 454.12,108.94"
        fill="#F7F1DE"
        stroke="rgba(8,42,80,.22)"
        strokeWidth={1}
      />
      <ellipse
        cx={258.31}
        cy={83.31}
        rx={11.75}
        ry={10.49}
        fill={GS39_BRAND_HEX.sky50}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1.5}
      />
      <line
        x1={258.31}
        y1={72.82}
        x2={258.31}
        y2={93.8}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1}
      />
      <line
        x1={246.56}
        y1={83.31}
        x2={270.06}
        y2={83.31}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1}
      />
      <rect
        x={62.5}
        y={108.94}
        width={404.68}
        height={320.42}
        fill="url(#sh-wall)"
        stroke="rgba(8,42,80,.18)"
        strokeWidth={1}
      />
      <rect x={57.27} y={207.98} width={415.13} height={4.66} fill="rgba(8,42,80,.12)" />
      <rect x={57.27} y={303.53} width={415.13} height={4.66} fill="rgba(8,42,80,.12)" />
      <rect x={57.27} y={406.06} width={415.13} height={23.3} fill="#B9AC8C" />

      <rect x={386.24} y={29.71} width={13.05} height={30.29} fill="#0B3565" />
      <polygon points="381.02,29.71 404.52,29.71 392.77,9.9" fill={GS39_BRAND_HEX.red} />
      <circle cx={392.77} cy={4.08} r={4.57} fill={GS39_BRAND_HEX.sun} />

      <g transform="translate(160.4, 353.63)">
        <rect x={0} y={0} width={54.83} height={25.63} rx={2} fill={GS39_BRAND_HEX.navy} />
        <text
          x={27.4}
          y={11.5}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={11}
          fontWeight={800}
          fill="#fff"
          letterSpacing={0.5}
        >
          150
        </text>
        <text
          x={27.4}
          y={21}
          textAnchor="middle"
          fontFamily="var(--font-ui)"
          fontWeight={800}
          fontSize={7}
          fill={GS39_BRAND_HEX.sun}
          letterSpacing={1}
        >
          JAHRE
        </text>
      </g>

      <ellipse cx={49.44} cy={435.19} rx={36.55} ry={16.31} fill="#4B9A23" opacity={0.85} />
      <ellipse cx={49.44} cy={429.37} rx={28.72} ry={13.98} fill="#6BB246" />
      <ellipse cx={480.23} cy={441.02} rx={28.72} ry={13.98} fill="#4B9A23" opacity={0.85} />
      <ellipse cx={480.23} cy={435.19} rx={22.19} ry={11.65} fill="#6BB246" />
      <rect x={271.36} y={441.02} width={52.22} height={3.5} fill="#8b6a3a" />
      <rect x={275.28} y={444.51} width={3.92} height={8.16} fill="#8b6a3a" />
      <rect x={315.75} y={444.51} width={3.92} height={8.16} fill="#8b6a3a" />

      {garden ? (
        <GardenPatch
          station={garden}
          visited={isVisited(garden.slug)}
          highlighted={isHighlighted(garden.slug)}
          onTap={handleTap}
        />
      ) : null}

      {inside.map((station) => (
        <StationWindow
          key={station.slug}
          station={station}
          visited={isVisited(station.slug)}
          highlighted={isHighlighted(station.slug)}
          onTap={handleTap}
        />
      ))}

      {effectiveVisited.size > 0 ? (
        <g transform="translate(393, 4)">
          <line x1={0} y1={0} x2={0} y2={-22} stroke="#0B3565" strokeWidth={1.5} />
          <polygon points="0,-22 14,-18 0,-14" fill={GS39_BRAND_HEX.red} />
        </g>
      ) : null}
    </svg>
  )
}
