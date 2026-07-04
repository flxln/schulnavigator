import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateStationsFile } from '@/lib/validate-stations'
import type { StationsFile } from '@/lib/types'
import { validateStationAssets } from './validate-station-assets'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = join(scriptDir, '..')
const stationsPath = join(appRoot, 'data', 'stations.json')
const raw = JSON.parse(readFileSync(stationsPath, 'utf8')) as StationsFile

try {
  validateStationsFile(raw)
} catch (err) {
  console.error(err instanceof Error ? err.message : 'Struktur-Validierung fehlgeschlagen')
  process.exit(1)
}

const { errors } = validateStationAssets(raw, { appRoot, checkFiles: false })

if (errors.length > 0) {
  for (const e of errors) {
    console.error(e)
  }
  console.error('\nvalidate:stations:structure fehlgeschlagen.')
  process.exit(1)
}

console.log('validate:stations:structure OK — JSON-Vertrag und Pfade wohlgeformt.')
