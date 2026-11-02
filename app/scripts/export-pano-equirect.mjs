#!/usr/bin/env node
/**
 * Equirectangular 2:1 Export: Rohdateien (Submodule) → optimiertes JPG
 * in auftraggeber/.../equirect/{slug}/export/ + Kopie nach app/public/stations/360/.
 *
 * Voraussetzung: macOS sips (lokal, nicht im Docker-Build).
 * Aufruf: node scripts/export-pano-equirect.mjs  (aus app/)
 * Optional: node scripts/export-pano-equirect.mjs musik daz  (nur angegebene Slugs)
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const repoRoot = join(appRoot, '..')
const panoRoot = join(repoRoot, 'auftraggeber', 'material', 'stationen-360-pano')
const stations360Dir = join(appRoot, 'public', 'stations', '360')

const MAX_BYTES = 12 * 1024 * 1024
const QUALITY_STEPS = [85, 80, 75, 70, 65, 60]
const FALLBACK_WIDTH = 4096

/** slug → relativer Pfad unter panoRoot/ */
const EXPORTS = [
  {
    slug: 'klassenzimmer',
    src: 'flat/klassenzimmer/raw/007-360-Klassenzimmer-Klasse-1d.JPG',
  },
  { slug: 'daz', src: 'flat/daz/raw/002-360-DaZ-Zimmer.JPG' },
  { slug: 'pc-raum', src: 'flat/pc-raum/raw/022-360-Computerraum.JPG' },
  { slug: 'werken', src: 'flat/werken/raw/010-1-360-Werkenzimmer.JPG' },
  { slug: 'turnhalle', src: 'flat/turnhalle/raw/005-1-360-Turnhalle.JPG' },
  { slug: 'speiseraum', src: 'flat/speiseraum/raw/014-360-Cafeteria.JPG' },
  { slug: 'lesewelt', src: 'flat/lesewelt/raw/011-360-Lesewelt.JPG' },
  { slug: 'musik', src: 'flat/musik/raw/009-360-Musikraum.JPG' },
  { slug: 'schulhof', src: 'flat/schulhof/raw/017-360-Schulhof.JPG' },
]

function jpegDimensions(fsPath) {
  const buf = readFileSync(fsPath)
  let i = 2
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      }
    }
    const len = buf.readUInt16BE(i + 2)
    i += 2 + len
  }
  return null
}

function exportOne({ slug, src }) {
  const sourcePath = join(panoRoot, src)
  if (!existsSync(sourcePath)) {
    throw new Error(`Quelle fehlt: ${sourcePath}`)
  }

  const dims = jpegDimensions(sourcePath)
  if (dims) {
    const ratio = dims.width / dims.height
    if (Math.abs(ratio - 2) > 0.04) {
      console.warn(
        `⚠ ${slug}: Seitenverhältnis ${ratio.toFixed(2)}:1 (erwartet 2:1) — ${dims.width}×${dims.height}`,
      )
    }
  }

  const exportDir = join(panoRoot, 'equirect', slug, 'export')
  mkdirSync(exportDir, { recursive: true })
  const exportPath = join(exportDir, `${slug}.jpg`)
  const appPath = join(stations360Dir, `${slug}.jpg`)

  let lastSize = Infinity
  for (const quality of QUALITY_STEPS) {
    execSync(
      `sips -s format jpeg -s formatOptions ${quality} "${sourcePath}" --out "${exportPath}"`,
      { stdio: 'pipe' },
    )
    lastSize = statSync(exportPath).size
    if (lastSize <= MAX_BYTES) {
      break
    }
  }

  if (lastSize > MAX_BYTES) {
    const scaledPath = join(exportDir, `${slug}-scaled.jpg`)
    execSync(
      `sips -Z ${FALLBACK_WIDTH} -s format jpeg -s formatOptions 75 "${sourcePath}" --out "${scaledPath}"`,
      { stdio: 'pipe' },
    )
    lastSize = statSync(scaledPath).size
    copyFileSync(scaledPath, exportPath)
    console.warn(
      `⚠ ${slug}: auf ${FALLBACK_WIDTH}px Breite skaliert (${Math.round(lastSize / 1024)} KB)`,
    )
  }

  if (lastSize > MAX_BYTES) {
    console.warn(
      `⚠ ${slug}: ${Math.round(lastSize / 1024)} KB — Schwellwert ${MAX_BYTES / 1024} KB überschritten`,
    )
  }

  copyFileSync(exportPath, appPath)
  const outDims = jpegDimensions(appPath)
  const dimStr = outDims ? `${outDims.width}×${outDims.height}` : '?'
  console.log(
    `✓ ${slug}: ${Math.round(lastSize / 1024)} KB (${dimStr}) → equirect/${slug}/export/ + public/stations/360/${slug}.jpg`,
  )
}

if (!existsSync(panoRoot)) {
  console.error(`Submodule-Pfad nicht gefunden: ${panoRoot}`)
  console.error('Bitte „git submodule update --init auftraggeber“ ausführen.')
  process.exit(1)
}

mkdirSync(stations360Dir, { recursive: true })

const filterSlugs = process.argv.slice(2)
const entries =
  filterSlugs.length > 0
    ? EXPORTS.filter((e) => filterSlugs.includes(e.slug))
    : EXPORTS

if (filterSlugs.length > 0 && entries.length === 0) {
  console.error(`Keine gültigen Slugs: ${filterSlugs.join(', ')}`)
  process.exit(1)
}

for (const entry of entries) {
  exportOne(entry)
}

console.log(`\nFertig — ${entries.length} Equirectangular-Exporte.`)
