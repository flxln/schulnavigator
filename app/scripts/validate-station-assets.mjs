import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const publicDir = join(appRoot, 'public')
const stationsPath = join(appRoot, 'data', 'stations.json')

const WARN_BYTES = 500 * 1024
const MIN_JPEG_BYTES = 1024
const JPEG_MAGIC = Buffer.from([0xff, 0xd8])
const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1'
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

function isJpegFile(fsPath) {
  const head = readFileSync(fsPath, { flag: 'r' }).subarray(0, 2)
  return head.length === 2 && head[0] === JPEG_MAGIC[0] && head[1] === JPEG_MAGIC[1]
}

function checkJpegAsset(label, urlPath, fsPath) {
  let st
  try {
    st = statSync(fsPath)
  } catch {
    return
  }
  if (st.size < MIN_JPEG_BYTES) {
    console.error(
      `${label}: ${urlPath} ist zu klein (${st.size} B) — vermutlich LFS-Pointer oder leere Datei`,
    )
    process.exitCode = 1
    return
  }
  if (!isJpegFile(fsPath)) {
    const peek = readFileSync(fsPath, 'utf8').slice(0, 80)
    if (peek.startsWith(LFS_POINTER_PREFIX)) {
      console.error(
        `${label}: ${urlPath} ist ein Git-LFS-Pointer — lokal „git lfs pull“ oder Build ohne Smudge`,
      )
    } else {
      console.error(`${label}: ${urlPath} ist keine gültige JPEG-Datei (Magic-Bytes fehlen)`)
    }
    process.exitCode = 1
    return
  }
  if (st.size > WARN_BYTES) {
    console.warn(
      `${label}: ${urlPath} ist groß (${Math.round(st.size / 1024)} KB, Schwellwert ${WARN_BYTES / 1024} KB)`,
    )
  }
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
  if (/\.jpe?g$/i.test(fsPath)) {
    checkJpegAsset(label, urlPath, fsPath)
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
    if (m?.poster && typeof m.poster === 'string' && m.poster.startsWith('/')) {
      checkPath(`Station ${slug} (medium ${m.id ?? '?'} poster)`, m.poster)
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
}

if (process.exitCode === 1) {
  console.error('\nvalidate:stations fehlgeschlagen.')
  process.exit(1)
}

console.log(
  'validate:stations OK — alle referenzierten Dateien (public/ und content/) vorhanden.',
)
