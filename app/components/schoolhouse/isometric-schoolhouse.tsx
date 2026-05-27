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
            d={`M ${x} ${y + h} L ${x} ${y + 18} Q ${x + w / 2} ${y - 8} ${x + w} ${y + 18} L ${x + w} ${y + h} Z`}
            fill={visited ? station.visitedDoorFill : '#2a2a35'}
            stroke={frameStroke}
            strokeWidth={2.5}
          />
          <line
            x1={x + w / 2}
            y1={y + 12}
            x2={x + w / 2}
            y2={y + h}
            stroke={frameStroke}
            strokeWidth={1.5}
          />
          <circle
            cx={x + w / 2 - 5}
            cy={y + h * 0.7}
            r={1.8}
            fill={GS39_BRAND_HEX.sun}
          />
          <circle
            cx={x + w / 2 + 5}
            cy={y + h * 0.7}
            r={1.8}
            fill={GS39_BRAND_HEX.sun}
          />
          <rect x={x - 6} y={y + h} width={w + 12} height={6} fill="#cfc6b3" />
          <rect
            x={x - 10}
            y={y + h + 6}
            width={w + 20}
            height={4}
            fill="#bcb29c"
          />
        </g>
      ) : (
        <g>
          <rect x={x - 4} y={y + h - 2} width={w + 8} height={5} fill="#b9a98c" />
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

      {visited ? (
        <g>
          <circle
            cx={x + w - 4}
            cy={y + 4}
            r={11}
            fill={accent}
            stroke={GS39_BRAND_HEX.paper}
            strokeWidth={2}
          />
          <path
            d={`M ${x + w - 9} ${y + 4} L ${x + w - 5} ${y + 8} L ${x + w + 1} ${y - 1}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g opacity={0.85}>
          <circle
            cx={x + w - 4}
            cy={y + 4}
            r={10}
            fill="rgba(255,255,255,.92)"
            stroke="rgba(8,42,80,.35)"
            strokeWidth={1}
          />
          <text
            x={x + w - 4}
            y={y + 7.5}
            textAnchor="middle"
            fontFamily="var(--font-ui)"
            fontSize={11}
            fontWeight={800}
            fill={GS39_BRAND_HEX.navy}
          >
            {station.nr}
          </text>
        </g>
      )}
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
  if (visited) {
    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={12}
          fill={station.accent}
          stroke={GS39_BRAND_HEX.paper}
          strokeWidth={2}
        />
        <path
          d={`M ${x - 5} ${y} L ${x - 1} ${y + 4} L ${x + 5} ${y - 4}`}
          fill="none"
          stroke="#fff"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    )
  }
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={11}
        fill="rgba(255,255,255,.95)"
        stroke="rgba(8,42,80,.35)"
        strokeWidth={1}
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fontFamily="var(--font-ui)"
        fontSize={11}
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
  const [hx, hy, hw, hh] = expandHitRect(50, 370, 210, 90)
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
        points="65,440 220,460 270,432 110,415"
        fill={visited ? '#7BAE5A' : '#9aa18f'}
        stroke={visited ? GS39_BRAND_HEX.green700 : 'rgba(8,42,80,.25)'}
        strokeWidth={1.5}
      />
      {[
        { p: '95,432 165,440 175,432 110,425', soil: '#6b4a2a' },
        { p: '125,420 198,427 210,419 140,413', soil: '#7a5530' },
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
                cx={110 + i * 30}
                cy={425 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
              <circle
                cx={130 + i * 30}
                cy={427 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
              <circle
                cx={150 + i * 30}
                cy={429 + i * 2}
                r={3.5}
                fill={GS39_BRAND_HEX.green700}
              />
            </>
          ) : null}
        </g>
      ))}
      {visited ? (
        <g transform="translate(80, 380)">
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
      <line x1={65} y1={440} x2={70} y2={460} stroke="#5e4a2e" strokeWidth={2} />
      <line x1={130} y1={444} x2={132} y2={462} stroke="#5e4a2e" strokeWidth={2} />
      <line x1={195} y1={452} x2={196} y2={464} stroke="#5e4a2e" strokeWidth={2} />
      <line
        x1={65}
        y1={448}
        x2={220}
        y2={464}
        stroke="#5e4a2e"
        strokeWidth={1.5}
      />
      <StationChip x={258} y={420} station={station} visited={visited} />
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

      {garden ? (
        <GardenPatch
          station={garden}
          visited={isVisited(garden.slug)}
          highlighted={isHighlighted(garden.slug)}
          onTap={handleTap}
        />
      ) : null}

      {gym ? (
        <GymBuilding
          station={gym}
          visited={isVisited(gym.slug)}
          highlighted={isHighlighted(gym.slug)}
          onTap={handleTap}
        />
      ) : null}

      <polygon
        points="490,140 568,108 568,400 490,415"
        fill="url(#sh-rightwall)"
        stroke="rgba(8,42,80,.25)"
        strokeWidth={1.2}
      />
      <polygon
        points="490,140 568,108 482,55 340,82"
        fill="url(#sh-roof)"
        stroke="#06203d"
        strokeWidth={1.2}
      />
      <polygon
        points="170,140 340,82 490,140"
        fill="url(#sh-roof)"
        stroke="#06203d"
        strokeWidth={1.2}
      />
      <polygon
        points="180,140 330,88 480,140"
        fill="#F7F1DE"
        stroke="rgba(8,42,80,.22)"
        strokeWidth={1}
      />
      <circle
        cx={330}
        cy={118}
        r={9}
        fill={GS39_BRAND_HEX.sky50}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1.5}
      />
      <line
        x1={330}
        y1={109}
        x2={330}
        y2={127}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1}
      />
      <line
        x1={321}
        y1={118}
        x2={339}
        y2={118}
        stroke={GS39_BRAND_HEX.navy}
        strokeWidth={1}
      />
      <rect
        x={180}
        y={140}
        width={310}
        height={275}
        fill="url(#sh-wall)"
        stroke="rgba(8,42,80,.18)"
        strokeWidth={1}
      />
      <rect x={176} y={225} width={318} height={4} fill="rgba(8,42,80,.12)" />
      <rect x={176} y={307} width={318} height={4} fill="rgba(8,42,80,.12)" />
      <rect x={176} y={395} width={318} height={20} fill="#B9AC8C" />

      {inside.map((station) => (
        <StationWindow
          key={station.slug}
          station={station}
          visited={isVisited(station.slug)}
          highlighted={isHighlighted(station.slug)}
          onTap={handleTap}
        />
      ))}

      <rect x={428} y={72} width={10} height={26} fill="#0B3565" />
      <polygon points="424,72 442,72 433,55" fill={GS39_BRAND_HEX.red} />
      <circle cx={433} cy={50} r={3.5} fill={GS39_BRAND_HEX.sun} />

      <g transform="translate(255, 350)">
        <rect x={0} y={0} width={42} height={22} rx={2} fill={GS39_BRAND_HEX.navy} />
        <text
          x={21}
          y={10}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={10}
          fill="#fff"
          letterSpacing={0.5}
        >
          150
        </text>
        <text
          x={21}
          y={19}
          textAnchor="middle"
          fontFamily="var(--font-ui)"
          fontWeight={800}
          fontSize={6.5}
          fill={GS39_BRAND_HEX.sun}
          letterSpacing={1}
        >
          JAHRE
        </text>
      </g>

      <ellipse cx={170} cy={420} rx={28} ry={14} fill="#4B9A23" opacity={0.85} />
      <ellipse cx={170} cy={415} rx={22} ry={12} fill="#6BB246" />
      <ellipse cx={500} cy={425} rx={22} ry={12} fill="#4B9A23" opacity={0.85} />
      <ellipse cx={500} cy={420} rx={17} ry={10} fill="#6BB246" />
      <rect x={340} y={425} width={40} height={3} fill="#8b6a3a" />
      <rect x={343} y={428} width={3} height={7} fill="#8b6a3a" />
      <rect x={374} y={428} width={3} height={7} fill="#8b6a3a" />

      {effectiveVisited.size > 0 ? (
        <g transform="translate(433, 50)">
          <line x1={0} y1={0} x2={0} y2={-22} stroke="#0B3565" strokeWidth={1.5} />
          <polygon points="0,-22 14,-18 0,-14" fill={GS39_BRAND_HEX.red} />
        </g>
      ) : null}
    </svg>
  )
}
