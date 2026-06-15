import {
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import type { Station, StationsFile } from '@/lib/types'
import {
  buildEntryUrl,
  buildRoomUrl,
  normalizeBaseUrl,
  warnIfUrlTooLong,
} from '@/lib/qr-urls'
import {
  ENTRY_QRS,
  EXPECTED_STATION_COUNT,
  SCHULFEST_ENTRY_FILES,
  SCHULFEST_QR_SLUGS,
  URL_LENGTH_WARN,
} from './qr-config.mjs'
import {
  buildA4GridPdf,
  buildA4TwoUpPdf,
  GRID_ITEMS_PER_PAGE,
  pageCountForItems,
  TWO_UP_ITEMS_PER_PAGE,
  TWO_UP_QR_MM,
} from './qr-pdf-layouts'
import {
  toPrintItems,
  qrWidthPxForMm,
  type QrPrintItem,
} from './qr-print-items'
import { loadEnvLocal } from './load-env-local.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const qrDir = join(appRoot, 'public', 'qr')
const pdfDir = join(qrDir, 'pdf')

interface ManifestEntry {
  file: string
  url: string
  token: string
  mode: 'fest' | 'heft'
}

interface ManifestRoom {
  file: string
  url: string
  slug: string
  titel: string
}

interface Manifest {
  generatedAt: string
  baseUrl: string
  entries: ManifestEntry[]
  rooms: ManifestRoom[]
}

function parseArgs(argv: string[]) {
  let dryRun = false
  let size: number | undefined
  let preset: 'all' | 'schulfest' = 'all'
  let onlySlugs: string[] | undefined
  for (const arg of argv) {
    if (arg === '--dry-run') {
      dryRun = true
    }
    if (arg.startsWith('--size=')) {
      const n = Number(arg.slice('--size='.length))
      if (Number.isFinite(n) && n > 0) {
        size = Math.floor(n)
      }
    }
    if (arg === '--preset=schulfest') {
      preset = 'schulfest'
    }
    if (arg.startsWith('--only=')) {
      onlySlugs = arg
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  return { dryRun, size, preset, onlySlugs }
}

function parseSizeFromEnv(): number | undefined {
  const raw = process.env['QR_PRINT_WIDTH_PX']
  if (!raw) {
    return undefined
  }
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

function cleanPngOutput() {
  let entries
  try {
    entries = readdirSync(qrDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    if (ent.isFile() && ent.name.endsWith('.png')) {
      unlinkSync(join(qrDir, ent.name))
    }
  }
}

function cleanPdfOutput() {
  let entries
  try {
    entries = readdirSync(pdfDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    if (ent.isFile() && ent.name.endsWith('.pdf')) {
      unlinkSync(join(pdfDir, ent.name))
    }
  }
}

function pdfNamePrefix(preset: 'all' | 'schulfest'): string {
  return preset === 'schulfest' ? 'qr-schulfest' : 'qr'
}

async function buildQrBuffers(
  items: QrPrintItem[],
): Promise<Map<string, Uint8Array>> {
  const pdfQrWidth = qrWidthPxForMm(TWO_UP_QR_MM)
  const buffers = new Map<string, Uint8Array>()
  for (const item of items) {
    const buf = await QRCode.toBuffer(item.url, {
      type: 'png',
      width: pdfQrWidth,
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    buffers.set(item.id, new Uint8Array(buf))
  }
  return buffers
}

function printDryRunPreview(
  printItems: QrPrintItem[],
  width: number,
  pdfPrefix: string,
) {
  const twoUpPages = pageCountForItems(
    printItems.length,
    TWO_UP_ITEMS_PER_PAGE,
  )
  const gridPages = pageCountForItems(printItems.length, GRID_ITEMS_PER_PAGE)
  console.log('\n[QR] Print-Items (Entry zuerst, Räume alphabetisch):')
  for (const item of printItems) {
    console.log(`  ${item.label}\t${item.subtitle}\t${item.url}`)
  }
  console.log(`\n[QR] Würde ${printItems.length} PNG-Dateien schreiben (width=${width}).`)
  console.log(
    `[QR] PDF-Vorschau: ${pdfPrefix}-a5-2up.pdf (${twoUpPages} Seite(n)), ${pdfPrefix}-a4-grid-3cm.pdf (${gridPages} Seite(n)).`,
  )
}

function resolveRoomSlugs(
  stations: Station[],
  preset: 'all' | 'schulfest',
  onlySlugs: string[] | undefined,
): string[] {
  const allSlugs = stations.map((s) => s.slug)
  const slugSet = new Set(allSlugs)

  let target: string[]
  if (onlySlugs?.length) {
    target = onlySlugs
  } else if (preset === 'schulfest') {
    target = [...SCHULFEST_QR_SLUGS]
  } else {
    return allSlugs
  }

  const missing = target.filter((slug) => !slugSet.has(slug))
  if (missing.length > 0) {
    console.error(
      `[QR] Unbekannte Slug(s) in Subset: ${missing.join(', ')} — prüfe stations.json / qr-config.mjs`,
    )
    process.exit(1)
  }
  return target
}

function resolveEntryQrs(preset: 'all' | 'schulfest') {
  if (preset === 'schulfest') {
    const festSet = new Set(SCHULFEST_ENTRY_FILES)
    return ENTRY_QRS.filter((e) => festSet.has(e.file))
  }
  return ENTRY_QRS
}

async function main() {
  const { dryRun, size: sizeArg, preset, onlySlugs } = parseArgs(
    process.argv.slice(2),
  )
  loadEnvLocal(appRoot)

  let baseUrl: string
  try {
    baseUrl = normalizeBaseUrl(process.env['NEXT_PUBLIC_BASE_URL'] ?? '')
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    process.exit(1)
  }

  if (baseUrl.startsWith('http://localhost')) {
    console.warn(
      '[QR] Hinweis: localhost-URLs sind nur zum Testen gedacht. Für Druck die Produktions-Domain aus Issue #16 verwenden.',
    )
  }

  const width = sizeArg ?? parseSizeFromEnv() ?? 512

  const stationsPath = join(appRoot, 'data', 'stations.json')
  const raw = JSON.parse(readFileSync(stationsPath, 'utf8')) as unknown
  const { stations } = raw as StationsFile
  if (!Array.isArray(stations) || stations.length < 1) {
    console.error('stations.json: stations fehlt oder ist leer.')
    process.exit(1)
  }

  if (stations.length !== EXPECTED_STATION_COUNT) {
    console.warn(
      `[QR] Erwartet wurden ${EXPECTED_STATION_COUNT} Stationen, gefunden: ${stations.length}. QR-Anzahl passt sich an.`,
    )
  }

  for (const s of stations as Station[]) {
    if (!s.bild) {
      console.warn(
        `[QR] Station "${s.slug}" hat kein bild-Feld — Inhalt der Seite ok, Drucklayout ggf. prüfen.`,
      )
    }
  }

  mkdirSync(qrDir, { recursive: true })

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    entries: [],
    rooms: [],
  }

  const entryQrs = resolveEntryQrs(preset)
  const roomSlugs = resolveRoomSlugs(stations as Station[], preset, onlySlugs)
  const stationBySlug = new Map(
    (stations as Station[]).map((s) => [s.slug, s] as const),
  )

  if (preset === 'schulfest' || onlySlugs) {
    console.log(
      `[QR] Subset-Modus: ${entryQrs.length} Entry + ${roomSlugs.length} Raum-QR`,
    )
  }

  for (const entry of entryQrs) {
    const url = buildEntryUrl(baseUrl, entry.token)
    warnIfUrlTooLong(url, entry.file, URL_LENGTH_WARN)
    manifest.entries.push({
      file: entry.file,
      url,
      token: entry.token,
      mode: entry.mode,
    })
  }

  for (const slug of roomSlugs) {
    const s = stationBySlug.get(slug)
    if (!s) {
      continue
    }
    const url = buildRoomUrl(baseUrl, s.slug)
    warnIfUrlTooLong(url, `raum-${s.slug}`, URL_LENGTH_WARN)
    manifest.rooms.push({
      file: `raum-${s.slug}.png`,
      url,
      slug: s.slug,
      titel: s.titel,
    })
  }

  if (dryRun) {
    console.log(
      '[QR] Dry-Run — keine PNGs/PDFs, kein Löschen, kein manifest.json.\n',
    )
    console.log(JSON.stringify(manifest, null, 2))
    const printItems = toPrintItems(manifest)
    printDryRunPreview(printItems, width, pdfNamePrefix(preset))
    return
  }

  cleanPngOutput()
  cleanPdfOutput()
  mkdirSync(pdfDir, { recursive: true })

  const printItems = toPrintItems(manifest)

  const qrOptions = {
    type: 'png' as const,
    width,
    errorCorrectionLevel: 'H' as const,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  }

  for (const item of manifest.entries) {
    const out = join(qrDir, item.file)
    await QRCode.toFile(out, item.url, qrOptions)
  }

  for (const room of manifest.rooms) {
    const out = join(qrDir, room.file)
    await QRCode.toFile(out, room.url, qrOptions)
  }

  const qrBuffers = await buildQrBuffers(printItems)
  const pdfPrefix = pdfNamePrefix(preset)
  const twoUpName = `${pdfPrefix}-a5-2up.pdf`
  const gridName = `${pdfPrefix}-a4-grid-3cm.pdf`
  const twoUpPdf = await buildA4TwoUpPdf(printItems, qrBuffers)
  const gridPdf = await buildA4GridPdf(printItems, qrBuffers)
  writeFileSync(join(pdfDir, twoUpName), twoUpPdf)
  writeFileSync(join(pdfDir, gridName), gridPdf)

  const manifestName =
    preset === 'schulfest' && !onlySlugs
      ? 'manifest-schulfest.json'
      : 'manifest.json'
  writeFileSync(
    join(qrDir, manifestName),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )

  const total = manifest.entries.length + manifest.rooms.length
  console.log(
    `[QR] ${total} PNG-Dateien geschrieben nach public/qr/ (width=${width}).`,
  )
  console.log(
    `[QR] 2 PDF-Dateien geschrieben nach public/qr/pdf/ (${twoUpName}, ${gridName}).`,
  )
  console.log(`[QR] ${manifestName} aktualisiert.\n`)
  for (const e of manifest.entries) {
    console.log(`  ${e.file}\t${e.url}`)
  }
  for (const r of manifest.rooms) {
    console.log(`  ${r.file}\t${r.url}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
