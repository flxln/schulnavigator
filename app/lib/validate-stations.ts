import type { Hotspot, Medium, Station, MediumTyp } from '@/lib/types'
import {
  EXPECTED_SEGMENT_IDS,
  EXPECTED_SEGMENT_ID_SET,
} from '@/lib/schoolhouse-layout'

const MEDIUM_TYPEN: readonly MediumTyp[] = ['audio', 'video', 'foto', 'text']

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw new Error(`stations.json: ${msg}`)
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isMediumTyp(v: unknown): v is MediumTyp {
  return (
    typeof v === 'string' && (MEDIUM_TYPEN as readonly string[]).includes(v)
  )
}

function validateMedium(m: unknown, ctx: string): Medium {
  assert(isRecord(m), `${ctx}: Medium ist kein Objekt`)
  assert(typeof m.id === 'string' && m.id.length > 0, `${ctx}: medium.id fehlt`)
  assert(isMediumTyp(m.typ), `${ctx}: medium.typ ungültig (${String(m.typ)})`)
  assert(
    typeof m.quelle === 'string' && m.quelle.length > 0,
    `${ctx}: medium.quelle fehlt`,
  )
  if (m.videoSource !== undefined) {
    assert(
      m.videoSource === 'upload' || m.videoSource === 'youtube',
      `${ctx}: videoSource ungültig`,
    )
  }
  if (m.untertitel !== undefined) {
    assert(
      typeof m.untertitel === 'string',
      `${ctx}: untertitel muss string sein`,
    )
  }
  return m as unknown as Medium
}

function validateHotspot(h: unknown, ctx: string): Hotspot {
  assert(isRecord(h), `${ctx}: Hotspot ist kein Objekt`)
  assert(
    typeof h.id === 'string' && h.id.length > 0,
    `${ctx}: hotspot.id fehlt`,
  )
  assert(
    typeof h.mediumId === 'string' && h.mediumId.length > 0,
    `${ctx}: hotspot.mediumId fehlt`,
  )
  assert(
    typeof h.x === 'number' && Number.isFinite(h.x),
    `${ctx}: hotspot.x fehlt`,
  )
  assert(
    typeof h.y === 'number' && Number.isFinite(h.y),
    `${ctx}: hotspot.y fehlt`,
  )
  assert(h.x >= 0 && h.x <= 1, `${ctx}: hotspot.x muss 0–1 sein`)
  assert(h.y >= 0 && h.y <= 1, `${ctx}: hotspot.y muss 0–1 sein`)
  if (h.label !== undefined) {
    assert(typeof h.label === 'string', `${ctx}: label muss string sein`)
  }
  if (h.radius !== undefined) {
    assert(
      typeof h.radius === 'number' && Number.isFinite(h.radius),
      `${ctx}: radius muss Zahl sein`,
    )
    assert(
      h.radius >= 0 && h.radius <= 1,
      `${ctx}: hotspot.radius muss 0–1 sein`,
    )
  }
  return h as unknown as Hotspot
}

function validateStation(raw: unknown, index: number): Station {
  const prefix = `stations[${index}]`
  assert(isRecord(raw), `${prefix}: Station ist kein Objekt`)
  assert(
    typeof raw.slug === 'string' && raw.slug.length > 0,
    `${prefix}: slug fehlt`,
  )
  assert(
    SLUG_RE.test(raw.slug),
    `${prefix}: slug "${raw.slug}" ist kein kebab-case`,
  )
  assert(
    typeof raw.titel === 'string' && raw.titel.length > 0,
    `${prefix}: titel fehlt`,
  )
  assert(
    typeof raw.beschreibung === 'string',
    `${prefix}: beschreibung fehlt oder kein string`,
  )
  if (raw.bild !== undefined) {
    assert(
      typeof raw.bild === 'string' && raw.bild.startsWith('/'),
      `${prefix}: bild muss mit / beginnen`,
    )
  }
  assert(Array.isArray(raw.medien), `${prefix}: medien muss Array sein`)
  const medien = raw.medien.map((m, i) =>
    validateMedium(m, `${prefix}.medien[${i}]`),
  )
  const mediumIds = new Set<string>()
  for (const medium of medien) {
    assert(
      !mediumIds.has(medium.id),
      `${prefix}: doppelte medium.id "${medium.id}"`,
    )
    mediumIds.add(medium.id)
  }
  let hotspots: Hotspot[] | undefined
  if (raw.hotspots !== undefined) {
    assert(Array.isArray(raw.hotspots), `${prefix}: hotspots muss Array sein`)
    hotspots = raw.hotspots.map((h, i) =>
      validateHotspot(h, `${prefix}.hotspots[${i}]`),
    )
    const hotspotIds = new Set<string>()
    for (const hs of hotspots) {
      assert(
        !hotspotIds.has(hs.id),
        `${prefix}: doppelte hotspot.id "${hs.id}"`,
      )
      hotspotIds.add(hs.id)
      assert(
        mediumIds.has(hs.mediumId),
        `${prefix}: hotspot "${hs.id}" verweist auf unbekanntes mediumId "${hs.mediumId}"`,
      )
    }
  }
  assert(
    typeof raw.puzzleSegmentId === 'string' && raw.puzzleSegmentId.length > 0,
    `${prefix}: puzzleSegmentId fehlt oder ist leer`,
  )
  assert(
    EXPECTED_SEGMENT_ID_SET.has(raw.puzzleSegmentId),
    `${prefix}: puzzleSegmentId "${raw.puzzleSegmentId}" ist kein gültiges Schulhaus-Segment`,
  )
  return {
    slug: raw.slug,
    titel: raw.titel,
    beschreibung: raw.beschreibung,
    bild: raw.bild as string | undefined,
    medien,
    hotspots,
    puzzleSegmentId: raw.puzzleSegmentId,
  }
}

export function validateStationsFile(raw: unknown): Station[] {
  assert(isRecord(raw), 'Root muss Objekt sein')
  assert(Array.isArray(raw.stations), 'stations muss Array sein')
  assert(raw.stations.length > 0, 'stations ist leer')
  const slugs = new Set<string>()
  const stations = raw.stations.map((s, i) => {
    const st = validateStation(s, i)
    assert(!slugs.has(st.slug), `doppelter slug "${st.slug}"`)
    slugs.add(st.slug)
    return st
  })
  assert(
    stations.length === EXPECTED_SEGMENT_IDS.length,
    `stations: erwartet ${EXPECTED_SEGMENT_IDS.length} Einträge, erhalten ${stations.length}`,
  )
  const puzzleIds = new Set<string>()
  for (const st of stations) {
    assert(
      !puzzleIds.has(st.puzzleSegmentId),
      `doppeltes puzzleSegmentId "${st.puzzleSegmentId}"`,
    )
    puzzleIds.add(st.puzzleSegmentId)
  }
  const expected = new Set(EXPECTED_SEGMENT_IDS)
  assert(
    puzzleIds.size === expected.size,
    'stations: Anzahl puzzleSegmentId stimmt nicht mit Schulhaus-Layout überein',
  )
  for (const id of expected) {
    assert(puzzleIds.has(id), `stations: fehlendes puzzleSegmentId "${id}"`)
  }
  return stations
}
