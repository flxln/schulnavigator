import type {
  Dialog,
  DialogBubbleLayout,
  DialogBubbleTail,
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
  MAX_BUBBLE_FONT_SIZE,
  MAX_BUBBLE_MAX_WIDTH,
  MAX_BUBBLE_X,
  MAX_BUBBLE_Y,
  MIN_BUBBLE_FONT_SIZE,
  MIN_BUBBLE_MAX_WIDTH,
  MIN_BUBBLE_X,
  MIN_BUBBLE_Y,
} from '@/lib/dialog-bubble-layout'
import {
  buildHubStations,
  HUB_SLUG_MAP,
} from '@/lib/schoolhouse-hub-map'
import { isValidHttpsUrl } from '@/lib/external-link'
import {
  MAX_ICON_SIZE_NORM,
  MAX_MASCOT_SIZE_NORM,
  MIN_ICON_SIZE_NORM,
  MIN_MASCOT_SIZE_NORM,
} from '@/lib/raum-viewer/constants'

const EXPECTED_STATION_COUNT = Object.keys(HUB_SLUG_MAP).length

const MEDIUM_TYPEN: readonly MediumTyp[] = [
  'audio',
  'video',
  'foto',
  'text',
  'link',
]

const DIALOG_FIGUREN: readonly DialogFigure[] = ['frieda', 'otto']
const DIALOG_ROLLEN: readonly DialogRolle[] = ['frieda', 'otto', 'beide']
const DIALOG_BUBBLE_TAILS: readonly DialogBubbleTail[] = [
  'left',
  'right',
  'center',
]

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
  if (m.typ === 'link') {
    assert(
      isValidHttpsUrl(m.quelle),
      `${ctx}: link.quelle muss gültige https-URL sein`,
    )
    assert(
      m.videoSource === undefined,
      `${ctx}: link darf kein videoSource haben`,
    )
    assert(m.poster === undefined, `${ctx}: link darf kein poster haben`)
    if (m.openIn !== undefined) {
      assert(
        m.openIn === 'external',
        `${ctx}: openIn muss 'external' sein`,
      )
    }
  } else if (m.openIn !== undefined) {
    assert(false, `${ctx}: openIn nur bei typ 'link' erlaubt`)
  }
  if (m.videoSource !== undefined) {
    assert(
      m.videoSource === 'upload' || m.videoSource === 'youtube',
      `${ctx}: videoSource ungültig`,
    )
  }
  if (m.poster !== undefined) {
    assert(
      m.typ === 'video',
      `${ctx}: poster darf nur bei typ 'video' gesetzt sein`,
    )
    assert(
      typeof m.poster === 'string' && m.poster.startsWith('/'),
      `${ctx}: poster muss string mit führendem / sein`,
    )
  }
  if (m.thumbnail !== undefined) {
    assert(
      typeof m.thumbnail === 'string' && m.thumbnail.startsWith('/'),
      `${ctx}: thumbnail muss string mit führendem / sein`,
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
  assert(h.x >= 0 && h.x <= 1, `${ctx}: hotspot.x muss 0–1 sein (Quellbild)`)
  assert(
    h.y >= 0 && h.y <= 1,
    `${ctx}: hotspot.y muss 0–1 sein (sichtbarer Ausschnitt: 0 oben, 1 unten)`,
  )
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
    if (h.mascotSize !== undefined) {
      assert(
        typeof h.mascotSize === 'number' && Number.isFinite(h.mascotSize),
        `${ctx}: mascotSize muss Zahl sein`,
      )
      assert(
        h.mascotSize >= MIN_MASCOT_SIZE_NORM &&
          h.mascotSize <= MAX_MASCOT_SIZE_NORM,
        `${ctx}: mascotSize muss ${MIN_MASCOT_SIZE_NORM}–${MAX_MASCOT_SIZE_NORM} sein`,
      )
    }
    if (h.mascotFlipX !== undefined) {
      assert(
        typeof h.mascotFlipX === 'boolean',
        `${ctx}: mascotFlipX muss boolean sein`,
      )
    }
    assert(
      h.icon === undefined,
      `${ctx}: dialog-Hotspot darf kein icon haben`,
    )
    assert(
      h.iconSize === undefined,
      `${ctx}: dialog-Hotspot darf kein iconSize haben`,
    )
    return {
      id: h.id,
      label: h.label as string | undefined,
      x: h.x,
      y: h.y,
      radius: h.radius as number | undefined,
      action: 'dialog',
      mascot: h.mascot,
      mascotSize: h.mascotSize as number | undefined,
      mascotFlipX: h.mascotFlipX as boolean | undefined,
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
  assert(
    h.mascotSize === undefined,
    `${ctx}: medium-Hotspot darf kein mascotSize haben`,
  )
  assert(
    h.mascotFlipX === undefined,
    `${ctx}: medium-Hotspot darf kein mascotFlipX haben`,
  )
  if (h.icon !== undefined) {
    assert(
      typeof h.icon === 'string' && h.icon.startsWith('/'),
      `${ctx}: icon muss string mit führendem / sein`,
    )
  }
  if (h.iconSize !== undefined) {
    assert(
      typeof h.iconSize === 'number' && Number.isFinite(h.iconSize),
      `${ctx}: iconSize muss Zahl sein`,
    )
    assert(
      h.iconSize >= MIN_ICON_SIZE_NORM && h.iconSize <= MAX_ICON_SIZE_NORM,
      `${ctx}: iconSize muss ${MIN_ICON_SIZE_NORM}–${MAX_ICON_SIZE_NORM} sein`,
    )
  }
  return {
    id: h.id,
    label: h.label as string | undefined,
    x: h.x,
    y: h.y,
    radius: h.radius as number | undefined,
    action: 'medium',
    mediumId: h.mediumId,
    icon: h.icon as string | undefined,
    iconSize: h.iconSize as number | undefined,
  }
}

function isDialogFigure(v: unknown): v is DialogFigure {
  return typeof v === 'string' && (DIALOG_FIGUREN as readonly string[]).includes(v)
}

function isDialogRolle(v: unknown): v is DialogRolle {
  return typeof v === 'string' && (DIALOG_ROLLEN as readonly string[]).includes(v)
}

function isDialogBubbleTail(v: unknown): v is DialogBubbleTail {
  return (
    typeof v === 'string' &&
    (DIALOG_BUBBLE_TAILS as readonly string[]).includes(v)
  )
}

function validateDialogBubble(raw: unknown, prefix: string): DialogBubbleLayout {
  assert(isRecord(raw), `${prefix}: bubble ist kein Objekt`)
  if (raw.y !== undefined) {
    assert(
      typeof raw.y === 'number' && Number.isFinite(raw.y),
      `${prefix}.bubble.y muss Zahl sein`,
    )
    assert(
      raw.y >= MIN_BUBBLE_Y && raw.y <= MAX_BUBBLE_Y,
      `${prefix}.bubble.y muss ${MIN_BUBBLE_Y}–${MAX_BUBBLE_Y} sein`,
    )
  }
  if (raw.x !== undefined) {
    assert(
      typeof raw.x === 'number' && Number.isFinite(raw.x),
      `${prefix}.bubble.x muss Zahl sein`,
    )
    assert(
      raw.x >= MIN_BUBBLE_X && raw.x <= MAX_BUBBLE_X,
      `${prefix}.bubble.x muss ${MIN_BUBBLE_X}–${MAX_BUBBLE_X} sein`,
    )
  }
  if (raw.maxWidth !== undefined) {
    assert(
      typeof raw.maxWidth === 'number' && Number.isFinite(raw.maxWidth),
      `${prefix}.bubble.maxWidth muss Zahl sein`,
    )
    assert(
      raw.maxWidth >= MIN_BUBBLE_MAX_WIDTH &&
        raw.maxWidth <= MAX_BUBBLE_MAX_WIDTH,
      `${prefix}.bubble.maxWidth muss ${MIN_BUBBLE_MAX_WIDTH}–${MAX_BUBBLE_MAX_WIDTH} sein`,
    )
  }
  if (raw.fontSize !== undefined) {
    assert(
      typeof raw.fontSize === 'number' && Number.isFinite(raw.fontSize),
      `${prefix}.bubble.fontSize muss Zahl sein`,
    )
    assert(
      raw.fontSize >= MIN_BUBBLE_FONT_SIZE &&
        raw.fontSize <= MAX_BUBBLE_FONT_SIZE,
      `${prefix}.bubble.fontSize muss ${MIN_BUBBLE_FONT_SIZE}–${MAX_BUBBLE_FONT_SIZE} sein`,
    )
  }
  if (raw.followPan !== undefined) {
    assert(
      typeof raw.followPan === 'boolean',
      `${prefix}.bubble.followPan muss boolean sein`,
    )
  }
  return {
    y: raw.y as number | undefined,
    x: raw.x as number | undefined,
    maxWidth: raw.maxWidth as number | undefined,
    fontSize: raw.fontSize as number | undefined,
    followPan: raw.followPan as boolean | undefined,
  }
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
  if (raw.tail !== undefined) {
    assert(isDialogBubbleTail(raw.tail), `${ctx}: tail ungültig`)
  }
  return {
    id: raw.id,
    rolle: raw.rolle,
    quelle: raw.quelle,
    text: raw.text,
    gruppe: raw.gruppe as string | undefined,
    tail: raw.tail as DialogBubbleTail | undefined,
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
  let bubble: DialogBubbleLayout | undefined
  if (raw.bubble !== undefined) {
    bubble = validateDialogBubble(raw.bubble, prefix)
  }
  return {
    figuren,
    segmente,
    gruppen: gruppen.length > 0 ? gruppen : undefined,
    bubble,
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
    HUB_SLUG_MAP[raw.slug] !== undefined,
    `${prefix}: slug "${raw.slug}" hat keine Hub-Zuordnung (ADR-016)`,
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
  const expectedSlugs = new Set(Object.keys(HUB_SLUG_MAP))
  for (const slug of expectedSlugs) {
    assert(slugs.has(slug), `stations: fehlender slug "${slug}" für Hub`)
  }
  buildHubStations(stations)
  return stations
}
