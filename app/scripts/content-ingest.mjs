#!/usr/bin/env node
/**
 * Medien-Datei ins richtige public/media/{slug}/-Verzeichnis kopieren;
 * optional medien[]-Eintrag in stations.json anhängen.
 *
 * @example
 * npm run content:ingest -- --slug werken --typ audio --file ~/Downloads/clip.m4a --untertitel "Unser Werken"
 * npm run content:ingest -- --slug werken --typ foto --file ./foto.jpg --dry-run
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const stationsPath = join(appRoot, 'data', 'stations.json')
const publicDir = join(appRoot, 'public')

const HUB_SLUGS = [
  'klassenzimmer',
  'musik',
  'daz',
  'kunst',
  'pc-raum',
  'lesewelt',
  'werken',
  'speiseraum',
  'hort',
  'turnhalle',
  'schulsozialarbeit',
  'schulhof',
]

const TYP_TO_FOLDER = {
  audio: 'audio',
  video: 'video',
  foto: 'fotos',
  text: 'texte',
}

const TYP_DEFAULT_EXT = {
  audio: '.mp3',
  video: '.mp4',
  foto: '.jpg',
  text: '.md',
}

function usage(exitCode = 1) {
  console.error(`Verwendung:
  npm run content:ingest -- --slug <slug> --typ <audio|video|foto|text> --file <pfad> [Optionen]

Optionen:
  --id <medium-id>       Default: {slug}-{basename ohne Endung}
  --untertitel <text>    Für audio/video/text empfohlen
  --append               medien[]-Eintrag an Station anhängen (Default)
  --no-append            Nur Datei kopieren, JSON unverändert
  --dry-run              Nichts schreiben, nur anzeigen
  --help

Beispiel:
  npm run content:ingest -- --slug werken --typ audio --file ./aufnahme.m4a --untertitel "Willkommen"
`)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const opts = {
    append: true,
    dryRun: false,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') usage(0)
    if (arg === '--dry-run') {
      opts.dryRun = true
      continue
    }
    if (arg === '--append') {
      opts.append = true
      continue
    }
    if (arg === '--no-append') {
      opts.append = false
      continue
    }
    const next = argv[i + 1]
    if (
      (arg === '--slug' ||
        arg === '--typ' ||
        arg === '--file' ||
        arg === '--id' ||
        arg === '--untertitel') &&
      next
    ) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      opts[key] = next
      i += 1
      continue
    }
    console.error(`Unbekanntes Argument: ${arg}`)
    usage()
  }
  return opts
}

function slugifyId(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function sanitizeFilename(name) {
  const base = basename(name)
  const ext = extname(base).toLowerCase()
  const stem = slugifyId(base.slice(0, base.length - ext.length) || 'datei')
  return `${stem || 'datei'}${ext || ''}`
}

function readStations() {
  const raw = readFileSync(stationsPath, 'utf8')
  return JSON.parse(raw)
}

function writeStations(data) {
  writeFileSync(stationsPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function runValidate() {
  const result = spawnSync('npm', ['run', 'validate:stations'], {
    cwd: appRoot,
    stdio: 'inherit',
    shell: true,
  })
  return result.status === 0
}

const opts = parseArgs(process.argv.slice(2))

if (!opts.slug || !opts.typ || !opts.file) {
  console.error('Fehlt: --slug, --typ und/oder --file')
  usage()
}

if (!HUB_SLUGS.includes(opts.slug)) {
  console.error(
    `Unbekannter slug "${opts.slug}". Erlaubt: ${HUB_SLUGS.join(', ')}`,
  )
  process.exit(1)
}

const folder = TYP_TO_FOLDER[opts.typ]
if (!folder) {
  console.error(
    `typ "${opts.typ}" nicht unterstützt. Nutze: ${Object.keys(TYP_TO_FOLDER).join(', ')}`,
  )
  console.error('Für link/embed: Snippet in stations.json (sn-medium-link / sn-medium-embed).')
  process.exit(1)
}

const sourcePath = resolve(opts.file)
if (!existsSync(sourcePath)) {
  console.error(`Datei nicht gefunden: ${sourcePath}`)
  process.exit(1)
}

let filename = sanitizeFilename(sourcePath)
const ext = extname(filename)
if (!ext && TYP_DEFAULT_EXT[opts.typ]) {
  filename = `${filename}${TYP_DEFAULT_EXT[opts.typ]}`
}

const destDir = join(publicDir, 'media', opts.slug, folder)
const destPath = join(destDir, filename)
const quelle = `/media/${opts.slug}/${folder}/${filename}`

const mediumId =
  opts.id?.trim() ||
  slugifyId(`${opts.slug}-${basename(filename, extname(filename))}`)

console.log('content:ingest')
console.log(`  slug:    ${opts.slug}`)
console.log(`  typ:     ${opts.typ}`)
console.log(`  quelle:  ${quelle}`)
console.log(`  ziel:    ${destPath}`)
if (opts.append) {
  console.log(`  medium:  id="${mediumId}"`)
}

if (opts.dryRun) {
  console.log('\n(dry-run — keine Änderungen)')
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(sourcePath, destPath)
console.log('\nDatei kopiert.')

if (!opts.append) {
  console.log('JSON unverändert (--no-append).')
  process.exit(0)
}

const stationsFile = readStations()
const station = stationsFile.stations?.find((s) => s.slug === opts.slug)
if (!station) {
  console.error(`Station "${opts.slug}" nicht in stations.json gefunden.`)
  process.exit(1)
}

if (!Array.isArray(station.medien)) {
  station.medien = []
}

if (station.medien.some((m) => m.id === mediumId)) {
  console.error(`medium.id "${mediumId}" existiert bereits in Station "${opts.slug}".`)
  process.exit(1)
}

const medium = {
  id: mediumId,
  typ: opts.typ,
  quelle,
}
if (opts.untertitel?.trim()) {
  medium.untertitel = opts.untertitel.trim()
}
if (opts.typ === 'video') {
  medium.videoSource = 'upload'
}

station.medien.push(medium)

const backupPath = `${stationsPath}.bak`
writeFileSync(backupPath, readFileSync(stationsPath), 'utf8')
writeStations(stationsFile)
console.log(`stations.json aktualisiert (Backup: ${basename(backupPath)}).`)

console.log('\nValidierung …')
if (!runValidate()) {
  console.error(
    '\nvalidate:stations fehlgeschlagen. Prüfe stations.json oder stelle aus .bak wieder her.',
  )
  process.exit(1)
}

console.log('\ncontent:ingest OK.')
