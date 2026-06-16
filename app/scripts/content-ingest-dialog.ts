#!/usr/bin/env tsx
/**
 * Dialog-WAV nach content/dialog-audio/{slug}/ — Konvention NN-rolle.wav;
 * verknüpft dialog.segmente[segmentIndex].quelle in stations.json.
 *
 * @example
 * npm run content:ingest-dialog -- --slug daz --segment 0 --file ./aufnahme.wav
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { ingestDialogClip, MpzUploadError } from '@/lib/mpz-dialog-audio-ingest'
import { MpzContentIoError } from '@/lib/mpz-content-io'

interface CliOptions {
  slug?: string
  segment?: number
  file?: string
  replace: boolean
}

function usage(exitCode = 1): never {
  console.error(`Verwendung:
  npm run content:ingest-dialog -- --slug <slug> --segment <0-basiert> --file <pfad> [--replace]

Optionen:
  --replace   Vorhandene WAV überschreiben (Default: Abbruch bei Kollision)
  --help
`)
  process.exit(exitCode)
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { replace: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') usage(0)
    if (arg === '--replace') {
      opts.replace = true
      continue
    }
    const next = argv[i + 1]
    if ((arg === '--slug' || arg === '--segment' || arg === '--file') && next) {
      if (arg === '--slug') opts.slug = next
      else if (arg === '--segment') opts.segment = Number.parseInt(next, 10)
      else if (arg === '--file') opts.file = next
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
  if (!opts.slug || opts.segment === undefined || !opts.file) {
    console.error('Fehlt: --slug, --segment und/oder --file')
    usage()
  }
  if (Number.isNaN(opts.segment)) {
    console.error('--segment muss eine Zahl sein')
    process.exit(1)
  }

  const sourcePath = resolve(opts.file)
  if (!existsSync(sourcePath)) {
    console.error(`Datei nicht gefunden: ${sourcePath}`)
    process.exit(1)
  }

  try {
    const result = await ingestDialogClip({
      slug: opts.slug,
      segmentIndex: opts.segment,
      source: { sourcePath },
      originalName: sourcePath,
      collision: opts.replace ? 'replace' : 'reject',
    })
    console.log('content:ingest-dialog OK')
    console.log(`  clip:    ${result.clip}`)
    console.log(`  quelle:  ${result.quelle}`)
    console.log(`  ziel:    ${result.destPath}`)
    console.log(`  segment: ${result.segmentId}`)
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
