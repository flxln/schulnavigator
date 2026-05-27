import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const publicDir = join(appRoot, 'public')
const stationsPath = join(appRoot, 'data', 'stations.json')

const WARN_BYTES = 500 * 1024
const MIN_PAN_DISPLAY_RATIO = 2
const REF_PHONE_W = 390
const REF_PHONE_H = 360

/** Worst-case Y-Sichtbarkeit bei quadratischem Quellbild (Heuristik Build-Zeit). */
function visibleYNormalRangeWorstCase(naturalAspect) {
  if (naturalAspect <= 0) {
    return { yMin: 0, yMax: 1 }
  }
  const targetAspect = (MIN_PAN_DISPLAY_RATIO * REF_PHONE_W) / REF_PHONE_H
  const zoom = naturalAspect < targetAspect ? targetAspect / naturalAspect : 1
  if (zoom <= 1) {
    return { yMin: 0, yMax: 1 }
  }
  return {
    yMin: (zoom - 1) / (2 * zoom),
    yMax: (zoom + 1) / (2 * zoom),
  }
}

const DIALOG_API_RE = /^\/api\/dialog\/([a-z0-9]+(-[a-z0-9]+)*)\/(\d{2}-[a-z]+\.wav)$/

function resolveAssetPath(urlPath) {
  if (typeof urlPath !== 'string' || !urlPath.startsWith('/')) {
    return null
  }
  const dialogMatch = urlPath.match(DIALOG_API_RE)
  if (dialogMatch) {
    const slug = dialogMatch[1]
    const clip = dialogMatch[3]
    return join(appRoot, 'content', 'dialog-audio', slug, clip)
  }
  const rel = urlPath.replace(/^\//, '')
  return join(publicDir, rel)
}

function checkPath(label, urlPath) {
  const fsPath = resolveAssetPath(urlPath)
  if (!fsPath) {
    console.error(`${label}: ungültiger Pfad "${urlPath}"`)
    process.exitCode = 1
    return
  }
  if (!existsSync(fsPath)) {
    console.error(`${label}: Datei fehlt — ${urlPath}`)
    process.exitCode = 1
    return
  }
  try {
    const st = statSync(fsPath)
    if (st.size > WARN_BYTES) {
      console.warn(
        `${label}: ${urlPath} ist groß (${Math.round(st.size / 1024)} KB, Schwellwert ${WARN_BYTES / 1024} KB)`,
      )
    }
  } catch {
    /* ignore */
  }
}

const raw = JSON.parse(readFileSync(stationsPath, 'utf8'))
const stations = raw.stations
if (!Array.isArray(stations)) {
  console.error('stations.json: stations ist kein Array')
  process.exit(1)
}

for (const st of stations) {
  const slug = st.slug ?? '?'
  if (typeof st.bild === 'string') {
    checkPath(`Station ${slug} (bild)`, st.bild)
  }
  const medien = Array.isArray(st.medien) ? st.medien : []
  for (const m of medien) {
    if (m?.quelle && typeof m.quelle === 'string' && m.quelle.startsWith('/')) {
      checkPath(`Station ${slug} (medium ${m.id ?? '?'})`, m.quelle)
    }
  }
  const dialogSegs = st.dialog?.segmente
  if (Array.isArray(dialogSegs)) {
    for (const seg of dialogSegs) {
      if (seg?.quelle && typeof seg.quelle === 'string' && seg.quelle.startsWith('/')) {
        checkPath(
          `Station ${slug} (dialog ${seg.id ?? '?'})`,
          seg.quelle,
        )
      }
    }
  }
  const hotspots = Array.isArray(st.hotspots) ? st.hotspots : []
  if (typeof st.bild === 'string' && hotspots.length > 0) {
    const { yMin, yMax } = visibleYNormalRangeWorstCase(1)
    for (const hs of hotspots) {
      const y = typeof hs?.y === 'number' ? hs.y : Number.NaN
      if (Number.isNaN(y)) {
        continue
      }
      if (y < yMin || y > yMax) {
        console.warn(
          `Station ${slug}: Hotspot „${hs.id ?? '?'}“ y=${y.toFixed(3)} kann bei schmalen Raumbildern vertikal abgeschnitten sein (Heuristik y sichtbar ${yMin.toFixed(3)}–${yMax.toFixed(3)}).`,
        )
      }
    }
  }
}

if (process.exitCode === 1) {
  console.error('\nvalidate:stations fehlgeschlagen.')
  process.exit(1)
}

console.log(
  'validate:stations OK — alle referenzierten Dateien (public/ und content/) vorhanden.',
)
