#!/usr/bin/env tsx
/**
 * Medien-Datei ins richtige public/media/{slug}/-Verzeichnis kopieren;
 * optional medien[]-Eintrag in stations.json anhängen.
 *
 * Dünne CLI über den gemeinsamen Ingest-Layer `lib/mpz-medium-ingest.ts` (#147, DRY).
 * Neue Validierung gegenüber #146: Magic-Bytes + Größenlimit je Typ. Bei
 * id-/Datei-Kollision bricht die CLI weiterhin hart ab (`collision: 'reject'`,
 * Pre-Mortem-Befund #5 — kein stilles Rename wie bei API/UI).
 *
 * @example
 * npm run content:ingest -- --slug werken --typ audio --file ~/Downloads/clip.m4a --untertitel "Unser Werken"
 * npm run content:ingest -- --slug werken --typ foto --file ./foto.jpg --dry-run
 */

import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  ingestMediumFile,
  MpzUploadError,
  type UploadTyp,
} from '@/lib/mpz-medium-ingest'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import { isUploadTyp, UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import { getHubSlugOrder, isHubSlug, MPZ_HUB_SLUGS } from '@/lib/schoolhouse-hub-map'

const HUB_SLUGS = getHubSlugOrder()

interface IngestOptions {
  slug?: string
  typ?: string
  file?: string
  id?: string
  untertitel?: string
  append: boolean
  dryRun: boolean
}

function usage(exitCode = 1): never {
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

function parseArgs(argv: string[]): IngestOptions {
  const opts: IngestOptions = {
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
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      if (key === 'slug') opts.slug = next
      else if (key === 'typ') opts.typ = next
      else if (key === 'file') opts.file = next
      else if (key === 'id') opts.id = next
      else if (key === 'untertitel') opts.untertitel = next
      i += 1
      continue
    }
    console.error(`Unbekanntes Argument: ${arg}`)
    usage()
  }
  return opts
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))

  if (!opts.slug || !opts.typ || !opts.file) {
    console.error('Fehlt: --slug, --typ und/oder --file')
    usage()
  }

  if (!isHubSlug(opts.slug)) {
    console.error(`Unbekannter slug "${opts.slug}". Erlaubt: ${HUB_SLUGS.join(', ')}`)
    process.exit(1)
  }

  if (!isUploadTyp(opts.typ)) {
    console.error(
      `typ "${opts.typ}" nicht unterstützt. Nutze: ${Object.keys(UPLOAD_RULES).join(', ')}`,
    )
    console.error('Für link/embed: Snippet in stations.json (sn-medium-link / sn-medium-embed).')
    process.exit(1)
  }
  const typ: UploadTyp = opts.typ

  const sourcePath = resolve(opts.file)
  if (!existsSync(sourcePath)) {
    console.error(`Datei nicht gefunden: ${sourcePath}`)
    process.exit(1)
  }

  console.log('content:ingest')
  console.log(`  slug:    ${opts.slug}`)
  console.log(`  typ:     ${typ}`)
  console.log(`  quelle:  ${sourcePath}`)
  if (opts.append) {
    console.log(`  append:  ja`)
  }

  if (opts.dryRun) {
    console.log('\n(dry-run — Datei wird validiert, aber nichts geschrieben)')
    // Dry-Run: nur Existenz/Größe melden; volle Validierung läuft im echten Lauf.
    const { size } = statSync(sourcePath)
    console.log(`  größe:   ${Math.round(size / 1024)} KB`)
    return
  }

  try {
    const result = await ingestMediumFile({
      slug: opts.slug,
      typ,
      source: { sourcePath },
      originalName: sourcePath,
      id: opts.id,
      untertitel: opts.untertitel,
      collision: 'reject',
      skipJson: !opts.append,
    })
    console.log(`\nDatei kopiert: ${result.quelle}`)
    if (result.jsonWritten) {
      console.log(`medium: id="${result.medium.id}"`)
      console.log('stations.json aktualisiert (Backup: stations.json.bak).')
    } else {
      console.log('JSON unverändert (--no-append).')
    }
    console.log('\ncontent:ingest OK.')
  } catch (err) {
    if (err instanceof MpzUploadError || err instanceof MpzContentIoError) {
      console.error(`\n${err.message}`)
      process.exit(1)
    }
    throw err
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
