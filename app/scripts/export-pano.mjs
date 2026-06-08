#!/usr/bin/env node
/**
 * Einmaliges Export-Skript: Panorama-Rohdateien (Submodule) → optimiertes JPG
 * in auftraggeber/.../flat/{slug}/export/ + Kopie nach app/public/stations/.
 *
 * Voraussetzung: macOS sips (lokal, nicht im Docker-Build).
 * Aufruf: node scripts/export-pano.mjs  (aus app/)
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const repoRoot = join(appRoot, '..')
const panoRoot = join(repoRoot, 'auftraggeber', 'material', 'stationen-360-pano')
const stationsDir = join(appRoot, 'public', 'stations')

const MAX_BYTES = 500 * 1024
const QUALITY_STEPS = [70, 60, 50, 40]

/** slug → relativer Pfad unter panoRoot/flat/{slug}/raw/ */
const EXPORTS = [
  {
    slug: 'klassenzimmer',
    src: 'flat/klassenzimmer/raw/006-Pano-Klassenzimmer-Klasse-1.JPG',
  },
  { slug: 'daz', src: 'flat/daz/raw/003-1-Pano-DaZ-Zimmer.JPG' },
  { slug: 'pc-raum', src: 'flat/pc-raum/raw/020-Pano-Computerraum.JPG' },
  { slug: 'werken', src: 'flat/werken/raw/009-Pano-Werkenzimmer.JPG' },
  { slug: 'turnhalle', src: 'flat/turnhalle/raw/005-Pano-Turnhalle.JPG' },
  { slug: 'speiseraum', src: 'flat/speiseraum/raw/013-Pano-Cafeteria.JPG' },
  { slug: 'lesewelt', src: 'flat/lesewelt/raw/012-Pano-Lesewelt.JPG' },
  { slug: 'musik', src: 'flat/musik/raw/009-1-Pano-Musikraum.JPG' },
]

function exportOne({ slug, src }) {
  const sourcePath = join(panoRoot, src)
  if (!existsSync(sourcePath)) {
    throw new Error(`Quelle fehlt: ${sourcePath}`)
  }

  const exportDir = join(panoRoot, 'flat', slug, 'export')
  mkdirSync(exportDir, { recursive: true })
  const exportPath = join(exportDir, `${slug}.jpg`)
  const appPath = join(stationsDir, `${slug}.jpg`)

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
    console.warn(
      `⚠ ${slug}: ${Math.round(lastSize / 1024)} KB nach Qualität ${QUALITY_STEPS.at(-1)} — Schwellwert ${MAX_BYTES / 1024} KB überschritten`,
    )
  }

  copyFileSync(exportPath, appPath)
  console.log(
    `✓ ${slug}: ${Math.round(lastSize / 1024)} KB → export/${slug}.jpg + public/stations/${slug}.jpg`,
  )
}

if (!existsSync(panoRoot)) {
  console.error(`Submodule-Pfad nicht gefunden: ${panoRoot}`)
  console.error('Bitte „git submodule update --init auftraggeber“ ausführen.')
  process.exit(1)
}

mkdirSync(stationsDir, { recursive: true })

for (const entry of EXPORTS) {
  exportOne(entry)
}

console.log(`\nFertig — ${EXPORTS.length} Panorama-Exporte.`)
