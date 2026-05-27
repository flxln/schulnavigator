import { GS39_BRAND_HEX, GS39_STATION_ACCENT_HEX } from '@/lib/gs39-brand-colors'
import { mixHex } from '@/lib/gs39-hex-blend'
import type { Station } from '@/lib/types'

/** Fenster-Slots an der Hauptfassade (viewBox 800×520). */
export type IsometricWindowRoom =
  | 'top-left'
  | 'top-mid'
  | 'top-right'
  | 'mid-left'
  | 'mid-mid'
  | 'mid-right'
  | 'ground-left'
  | 'ground-mid'
  | 'ground-right'

export type IsometricRoom = IsometricWindowRoom | 'gym' | 'garden'

export type IsometricSlugMapping = {
  room: IsometricRoom
  nr: number
}

/**
 * 11 Produktions-Slugs → SVG-Slot.
 * ground-mid = Eingangsbogen — vorläufig klassenzimmer (ADR-009, Abstimmung mit Schule).
 */
export const ISOMETRIC_SLUG_MAP: Record<string, IsometricSlugMapping> = {
  klassenzimmer: { room: 'ground-mid', nr: 1 },
  musik: { room: 'mid-left', nr: 2 },
  daz: { room: 'mid-mid', nr: 3 },
  kunst: { room: 'mid-right', nr: 4 },
  'pc-raum': { room: 'top-left', nr: 5 },
  lesewelt: { room: 'top-mid', nr: 6 },
  werken: { room: 'top-right', nr: 7 },
  speiseraum: { room: 'ground-left', nr: 8 },
  hort: { room: 'ground-right', nr: 9 },
  turnhalle: { room: 'gym', nr: 10 },
  schulsozialarbeit: { room: 'garden', nr: 11 },
}

export const ISOMETRIC_ROOM_FRAMES: Record<
  IsometricWindowRoom,
  readonly [x: number, y: number, w: number, h: number]
> = {
  'top-left': [205, 158, 60, 70],
  'top-mid': [305, 158, 60, 70],
  'top-right': [405, 158, 60, 70],
  'mid-left': [205, 240, 60, 70],
  'mid-mid': [305, 240, 60, 70],
  'mid-right': [405, 240, 60, 70],
  'ground-left': [205, 322, 60, 70],
  'ground-mid': [305, 322, 60, 70],
  'ground-right': [405, 322, 60, 70],
}

export type IsometricHubStation = {
  slug: string
  titel: string
  nr: number
  room: IsometricRoom
  accent: string
  visitedGlassFill: string
  visitedDoorFill: string
  visitedGymGlassFill: string
}

const SKY_50 = GS39_BRAND_HEX.sky50
const DOOR_BASE = '#2a3a52'

function accentForSlug(slug: string): string {
  const hex = GS39_STATION_ACCENT_HEX[slug]
  if (!hex) {
    throw new Error(`schoolhouse-isometric-map: kein Akzent für slug "${slug}"`)
  }
  return hex
}

function buildVisuals(accent: string) {
  return {
    accent,
    visitedGlassFill: mixHex(accent, SKY_50, 0.36),
    visitedDoorFill: mixHex(accent, DOOR_BASE, 0.24),
    visitedGymGlassFill: mixHex(accent, SKY_50, 0.28),
  }
}

export function getIsometricMapping(slug: string): IsometricSlugMapping {
  const mapping = ISOMETRIC_SLUG_MAP[slug]
  if (!mapping) {
    throw new Error(`schoolhouse-isometric-map: unbekannter slug "${slug}"`)
  }
  return mapping
}

export function buildIsometricHubStations(
  stations: readonly Station[],
): readonly IsometricHubStation[] {
  if (stations.length !== Object.keys(ISOMETRIC_SLUG_MAP).length) {
    throw new Error(
      `schoolhouse-isometric-map: erwartet ${Object.keys(ISOMETRIC_SLUG_MAP).length} Stationen, erhalten ${stations.length}`,
    )
  }

  const rooms = new Set<IsometricRoom>()
  const out: IsometricHubStation[] = []

  for (const station of stations) {
    const { room, nr } = getIsometricMapping(station.slug)
    if (rooms.has(room)) {
      throw new Error(
        `schoolhouse-isometric-map: doppelter room "${room}" für slug "${station.slug}"`,
      )
    }
    rooms.add(room)
    out.push({
      slug: station.slug,
      titel: station.titel,
      nr,
      room,
      ...buildVisuals(accentForSlug(station.slug)),
    })
  }

  out.sort((a, b) => a.nr - b.nr)
  return out
}

export function listIsometricRooms(
  hubStations: readonly IsometricHubStation[],
): IsometricRoom[] {
  return hubStations.map((s) => s.room)
}

export function isIsometricWindowRoom(
  room: IsometricRoom,
): room is IsometricWindowRoom {
  return room !== 'gym' && room !== 'garden'
}
