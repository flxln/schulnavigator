import type {
  Dialog,
  DialogFigure,
  DialogGruppe,
  DialogRolle,
  DialogSegment,
  Hotspot,
  HotspotAction,
  Medium,
  Station,
  MediumTyp,
} from '@/lib/types'
import {
  buildIsometricHubStations,
  ISOMETRIC_SLUG_MAP,
} from '@/lib/schoolhouse-isometric-map'

const EXPECTED_STATION_COUNT = Object.keys(ISOMETRIC_SLUG_MAP).length

const MEDIUM_TYPEN: readonly MediumTyp[] = ['audio', 'video', 'foto', 'text']

const DIALOG_FIGUREN: readonly DialogFigure[] = ['frieda', 'otto']
const DIALOG_ROLLEN: readonly DialogRolle[] = ['frieda', 'otto', 'beide']

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

function isHotspotAction(v: unknown): v is HotspotAction {
  return v === 'medium' || v === 'dialog'
}

function validateHotspot(h: unknown, ctx: string): Hotspot {
  assert(isRecord(h), `${ctx}: Hotspot ist kein Objekt`)
  assert(
    typeof h.id === 'string' && h.id.length > 0,
    `${ctx}: hotspot.id fehlt`,
  )
  assert(
    h.action === undefined || isHotspotAction(h.action),
    `${ctx}: action muss "medium" oder "dialog" sein`,
  )
  const action: HotspotAction =
    h.action === undefined ? 'medium' : (h.action as HotspotAction)
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
  if (action === 'dialog') {
    assert(
      h.mediumId === undefined,
      `${ctx}: dialog-Hotspot darf kein mediumId haben`,
    )
    assert(isDialogFigure(h.mascot), `${ctx}: mascot fehlt oder ungültig`)
    return {
      id: h.id,
      label: h.label as string | undefined,
      x: h.x,
      y: h.y,
      radius: h.radius as number | undefined,
      action: 'dialog',
      mascot: h.mascot,
    }
  }
  assert(
    typeof h.mediumId === 'string' && h.mediumId.length > 0,
    `${ctx}: hotspot.mediumId fehlt`,
  )
  assert(
    h.mascot === undefined,
    `${ctx}: medium-Hotspot darf kein mascot haben`,
  )
  return {
    id: h.id,
    label: h.label as string | undefined,
    x: h.x,
    y: h.y,
    radius: h.radius as number | undefined,
    action: 'medium',
    mediumId: h.mediumId,
  }
}

function isDialogFigure(v: unknown): v is DialogFigure {
  return typeof v === 'string' && (DIALOG_FIGUREN as readonly string[]).includes(v)
}

function isDialogRolle(v: unknown): v is DialogRolle {
  return typeof v === 'string' && (DIALOG_ROLLEN as readonly string[]).includes(v)
}

function validateDialogSegment(
  raw: unknown,
  ctx: string,
  gruppenIds: Set<string>,
): DialogSegment {
  assert(isRecord(raw), `${ctx}: Segment ist kein Objekt`)
  assert(
    typeof raw.id === 'string' && raw.id.length > 0,
    `${ctx}: segment.id fehlt`,
  )
  assert(isDialogRolle(raw.rolle), `${ctx}: segment.rolle ungültig`)
  assert(
    typeof raw.quelle === 'string' && raw.quelle.startsWith('/'),
    `${ctx}: segment.quelle muss mit / beginnen`,
  )
  assert(typeof raw.text === 'string', `${ctx}: segment.text fehlt`)
  if (raw.gruppe !== undefined) {
    assert(typeof raw.gruppe === 'string', `${ctx}: gruppe muss string sein`)
    assert(
      gruppenIds.has(raw.gruppe),
      `${ctx}: gruppe "${raw.gruppe}" unbekannt`,
    )
  }
  return {
    id: raw.id,
    rolle: raw.rolle,
    quelle: raw.quelle,
    text: raw.text,
    gruppe: raw.gruppe as string | undefined,
  }
}

function validateDialog(raw: unknown, prefix: string): Dialog {
  assert(isRecord(raw), `${prefix}: dialog ist kein Objekt`)
  assert(Array.isArray(raw.figuren), `${prefix}: dialog.figuren muss Array sein`)
  assert(raw.figuren.length > 0, `${prefix}: dialog.figuren ist leer`)
  const figuren: DialogFigure[] = []
  for (let i = 0; i < raw.figuren.length; i++) {
    const f = raw.figuren[i]
    assert(
      isDialogFigure(f),
      `${prefix}: figuren[${i}] muss frieda oder otto sein (nicht beide)`,
    )
    assert(
      !figuren.includes(f),
      `${prefix}: doppelte figur "${f}"`,
    )
    figuren.push(f)
  }
  const gruppen: DialogGruppe[] = []
  const gruppenIds = new Set<string>()
  if (raw.gruppen !== undefined) {
    assert(Array.isArray(raw.gruppen), `${prefix}: gruppen muss Array sein`)
    for (let i = 0; i < raw.gruppen.length; i++) {
      const g = raw.gruppen[i]
      const gctx = `${prefix}.gruppen[${i}]`
      assert(isRecord(g), `${gctx}: Gruppe ist kein Objekt`)
      assert(
        typeof g.id === 'string' && g.id.length > 0,
        `${gctx}: id fehlt`,
      )
      assert(
        !gruppenIds.has(g.id),
        `${prefix}: doppelte gruppen.id "${g.id}"`,
      )
      assert(typeof g.text === 'string', `${gctx}: text fehlt`)
      gruppenIds.add(g.id)
      gruppen.push({ id: g.id, text: g.text })
    }
  }
  assert(Array.isArray(raw.segmente), `${prefix}: segmente muss Array sein`)
  assert(raw.segmente.length > 0, `${prefix}: segmente ist leer`)
  const segmentIds = new Set<string>()
  const segmente: DialogSegment[] = []
  for (let i = 0; i < raw.segmente.length; i++) {
    const seg = validateDialogSegment(
      raw.segmente[i],
      `${prefix}.segmente[${i}]`,
      gruppenIds,
    )
    assert(
      !segmentIds.has(seg.id),
      `${prefix}: doppelte segment.id "${seg.id}"`,
    )
    segmentIds.add(seg.id)
    if (seg.rolle === 'beide') {
      assert(
        figuren.includes('frieda') && figuren.includes('otto'),
        `${prefix}: segment "${seg.id}" rolle beide erfordert frieda und otto in figuren`,
      )
    } else {
      assert(
        figuren.includes(seg.rolle),
        `${prefix}: segment "${seg.id}" rolle "${seg.rolle}" fehlt in figuren`,
      )
    }
    segmente.push(seg)
  }
  return {
    figuren,
    segmente,
    gruppen: gruppen.length > 0 ? gruppen : undefined,
  }
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
    ISOMETRIC_SLUG_MAP[raw.slug] !== undefined,
    `${prefix}: slug "${raw.slug}" hat keine isometrische Hub-Zuordnung (ADR-009)`,
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
  let dialog: Dialog | undefined
  if (raw.dialog !== undefined) {
    dialog = validateDialog(raw.dialog, prefix)
  }
  let hotspots: Hotspot[] | undefined
  if (raw.hotspots !== undefined) {
    assert(Array.isArray(raw.hotspots), `${prefix}: hotspots muss Array sein`)
    hotspots = raw.hotspots.map((h, i) =>
      validateHotspot(h, `${prefix}.hotspots[${i}]`),
    )
    const hotspotIds = new Set<string>()
    let mascotDialogCount = 0
    for (const hs of hotspots) {
      assert(
        !hotspotIds.has(hs.id),
        `${prefix}: doppelte hotspot.id "${hs.id}"`,
      )
      hotspotIds.add(hs.id)
      if (hs.action === 'dialog') {
        assert(
          dialog !== undefined,
          `${prefix}: dialog-Hotspot "${hs.id}" erfordert station.dialog`,
        )
        assert(
          dialog!.figuren.includes(hs.mascot!),
          `${prefix}: mascot "${hs.mascot}" fehlt in dialog.figuren`,
        )
        mascotDialogCount += 1
      } else {
        assert(
          hs.mediumId !== undefined && mediumIds.has(hs.mediumId),
          `${prefix}: hotspot "${hs.id}" verweist auf unbekanntes mediumId "${hs.mediumId}"`,
        )
      }
    }
    if (dialog !== undefined && mascotDialogCount === 1) {
      console.warn(
        `stations.json: ${prefix}: nur ein Maskottchen-Dialog-Hotspot — empfohlen: zwei (frieda + otto)`,
      )
    }
  }
  return {
    slug: raw.slug,
    titel: raw.titel,
    beschreibung: raw.beschreibung,
    bild: raw.bild as string | undefined,
    medien,
    hotspots,
    dialog,
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
    stations.length === EXPECTED_STATION_COUNT,
    `stations: erwartet ${EXPECTED_STATION_COUNT} Einträge, erhalten ${stations.length}`,
  )
  const expectedSlugs = new Set(Object.keys(ISOMETRIC_SLUG_MAP))
  for (const slug of expectedSlugs) {
    assert(slugs.has(slug), `stations: fehlender slug "${slug}" für isometrischen Hub`)
  }
  buildIsometricHubStations(stations)
  return stations
}
