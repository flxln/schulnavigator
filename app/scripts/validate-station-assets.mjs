import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const publicDir = join(appRoot, 'public')
const stationsPath = join(appRoot, 'data', 'stations.json')

const WARN_BYTES = 500 * 1024

function resolvePublicPath(urlPath) {
  if (typeof urlPath !== 'string' || !urlPath.startsWith('/')) {
    return null
  }
  const rel = urlPath.replace(/^\//, '')
  return join(publicDir, rel)
}

function checkPath(label, urlPath) {
  const fsPath = resolvePublicPath(urlPath)
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
}

if (process.exitCode === 1) {
  console.error('\nvalidate:stations fehlgeschlagen.')
  process.exit(1)
}

console.log(
  'validate:stations OK — alle referenzierten Dateien unter public/ vorhanden.',
)
