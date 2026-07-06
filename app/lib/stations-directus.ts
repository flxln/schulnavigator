import type { Dialog, DialogSegment, Hotspot360, Medium, Station } from '@/lib/types'
import raw from '@/data/stations.json'
import { getAllStations } from '@/lib/stations'
import { validateStationsFile } from '@/lib/validate-stations'

/**
 * Spike #251 — Wegwerf-Prototyp-Lesepfad. Wird nicht nach main gemergt.
 *
 * Merge-Strategie (Pre-Mortem 1a F1): validateStationsFile ist ein
 * Gesamtdokument-Vertrag (12 Stationen + Hub-Mapping). Eine Ein-Stations-Datei
 * ist strukturell nicht validierbar — die Directus-Row ersetzt daher nur den
 * `klassenzimmer`-Eintrag im importierten Build-JSON-Gesamtdokument, bevor der
 * Validator über das komplette Merge-Dokument läuft.
 */

const DIRECTUS_URL = process.env.SN_DIRECTUS_URL
const DIRECTUS_TOKEN = process.env.SN_DIRECTUS_TOKEN
const DIRECTUS_TIMEOUT_MS = 3000
const DIRECTUS_REVALIDATE_S = 60

type DirectusFetchOutcome =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; reason: 'DIRECTUS_UNREACHABLE' | 'DIRECTUS_SLUG_NOT_FOUND' }
  | { ok: false; reason: 'DIRECTUS_ERROR'; status: number }

function omitNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      ;(out as Record<string, unknown>)[key] = value
    }
  }
  return out
}

function transformMedium(row: Record<string, unknown>): Medium {
  return omitNullish({
    id: row.key,
    typ: row.typ,
    quelle: row.quelle,
    videoSource: row.videoSource,
    poster: row.poster,
    thumbnail: row.thumbnail,
    openIn: row.openIn,
    embedAllow: row.embedAllow,
    untertitel: row.untertitel,
  }) as unknown as Medium
}

/**
 * Field-Picking-Transform (Pre-Mortem 1a F4): Whitelist strikt pro `action`,
 * nicht nur nach `null`/`undefined` — Directus liefert für Boolean-Spalten
 * mit Schema-Default (`mascotFlipX`) `false` statt `null` auch für
 * medium-Hotspots, was der Validator sonst als verbotenes Feld ablehnt.
 */
function transformHotspot360(row: Record<string, unknown>): Hotspot360 {
  const isDialog = row.action === 'dialog'
  return omitNullish({
    id: row.key,
    label: row.label,
    action: row.action,
    mediumId: isDialog ? undefined : row.mediumId,
    icon: isDialog ? undefined : row.icon,
    iconSize: isDialog ? undefined : row.iconSize,
    mascot: isDialog ? row.mascot : undefined,
    mascotSize: isDialog ? row.mascotSize : undefined,
    mascotFlipX: isDialog ? row.mascotFlipX : undefined,
    bubblePitchOffset: isDialog ? row.bubblePitchOffset : undefined,
    yaw: row.yaw,
    pitch: row.pitch,
  }) as unknown as Hotspot360
}

function transformDialogSegment(row: Record<string, unknown>): DialogSegment {
  return omitNullish({
    id: row.key,
    rolle: row.rolle,
    quelle: row.quelle,
    text: row.text,
    gruppe: row.gruppe,
    tail: row.tail,
  }) as unknown as DialogSegment
}

function transformDialog(row: Record<string, unknown>): Dialog | undefined {
  const segmenteRaw = Array.isArray(row.dialog_segmente) ? row.dialog_segmente : []
  const figuren = Array.isArray(row.dialog_figuren) ? row.dialog_figuren : []
  if (figuren.length === 0 && segmenteRaw.length === 0) {
    return undefined
  }
  const segmente = [...(segmenteRaw as Record<string, unknown>[])]
    .sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0))
    .map(transformDialogSegment)
  return {
    figuren: figuren as Dialog['figuren'],
    segmente,
  }
}

/** Field-Picking-Transform (Pre-Mortem 1a F4): Whitelist pro Typ, `null` → Feld weglassen. */
function transformStationRow(row: Record<string, unknown>): Station {
  const medien = Array.isArray(row.medien)
    ? (row.medien as Record<string, unknown>[]).map(transformMedium)
    : []
  const hotspots360 = Array.isArray(row.hotspots360)
    ? (row.hotspots360 as Record<string, unknown>[]).map(transformHotspot360)
    : undefined
  const dialog = transformDialog(row)

  return omitNullish({
    slug: row.slug,
    titel: row.titel,
    beschreibung: row.beschreibung,
    viewer: row.viewer,
    bild: row.bild,
    panorama360: row.panorama360,
    startYaw: row.startYaw,
    startPitch: row.startPitch,
    startPanX: row.startPanX,
    medien,
    hotspots360,
    dialog,
  }) as unknown as Station
}

async function fetchStationFromDirectus(slug: string): Promise<DirectusFetchOutcome> {
  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    return { ok: false, reason: 'DIRECTUS_UNREACHABLE' }
  }
  const url = `${DIRECTUS_URL}/items/stations?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=*.*`
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      signal: AbortSignal.timeout(DIRECTUS_TIMEOUT_MS),
      next: { revalidate: DIRECTUS_REVALIDATE_S },
    })
    if (!res.ok) {
      return { ok: false, reason: 'DIRECTUS_ERROR', status: res.status }
    }
    const body = (await res.json()) as { data?: Record<string, unknown>[] }
    const row = body.data?.[0]
    if (!row) {
      return { ok: false, reason: 'DIRECTUS_SLUG_NOT_FOUND' }
    }
    return { ok: true, row }
  } catch {
    return { ok: false, reason: 'DIRECTUS_UNREACHABLE' }
  }
}

/**
 * Ersetzt den `klassenzimmer`-Eintrag im Build-JSON-Gesamtdokument durch die
 * Directus-Row und validiert das Merge-Dokument. Fällt bei jedem Fehler
 * (Fetch, leeres Ergebnis, Validierung) auf den reinen Build-JSON-Stand
 * zurück — der Besucherpfad bleibt in jedem Fall lauffähig (Kriterium 4).
 */
export async function getStationsForRequest(slug = 'klassenzimmer'): Promise<Station[]> {
  const outcome = await fetchStationFromDirectus(slug)
  if (!outcome.ok) {
    if (outcome.reason === 'DIRECTUS_ERROR') {
      console.error(`[stations-directus] DIRECTUS_ERROR_${outcome.status}`)
    } else {
      console.error(`[stations-directus] ${outcome.reason}`)
    }
    return [...getAllStations()]
  }

  let transformed: Station
  try {
    transformed = transformStationRow(outcome.row)
  } catch (err) {
    console.error('[stations-directus] Transform fehlgeschlagen', err)
    return [...getAllStations()]
  }

  const original = raw as { stations: Record<string, unknown>[] }
  const mergedRaw = {
    stations: original.stations.map((s) => (s.slug === slug ? transformed : s)),
  }

  try {
    return validateStationsFile(mergedRaw)
  } catch (err) {
    console.error('[stations-directus] Merge-Dokument ungültig, Fallback auf Build-JSON', err)
    return [...getAllStations()]
  }
}
