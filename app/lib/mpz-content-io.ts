import {
  copyFile,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import type { StationsFile } from '@/lib/types'
import { validateStationsFile } from '@/lib/validate-stations'
import { validateStationAssets } from '@/scripts/validate-station-assets'

export const MPZ_STATIONS_REL = 'data/stations.json'

export type MpzContentIoErrorCode = 'VALIDATION' | 'IO'

export class MpzContentIoError extends Error {
  readonly code: MpzContentIoErrorCode

  constructor(code: MpzContentIoErrorCode, message: string) {
    super(message)
    this.name = 'MpzContentIoError'
    this.code = code
  }
}

export interface WriteStationsOptions {
  /** Default true — validateStationsFile inkl. 12-Stationen-Pflicht */
  strict?: boolean
  /** Default false — CLI setzt true */
  validateAssets?: boolean
  /** Default false — Hub-Slug-Reihenfolge vor Write */
  canonicalize?: boolean
  /** Default true */
  makeBackup?: boolean
}

export interface MpzContentIoPaths {
  appRoot: string
  stationsPath: string
  backupPath: string
}

export interface MpzContentIo {
  readStations(): Promise<StationsFile>
  writeStations(data: StationsFile, options?: WriteStationsOptions): Promise<void>
  getPaths(): MpzContentIoPaths
}

const HUB_SLUG_ORDER = Object.keys(HUB_SLUG_MAP)

function defaultPaths(overrides?: Partial<MpzContentIoPaths>): MpzContentIoPaths {
  const libDir = dirname(fileURLToPath(import.meta.url))
  const appRoot = overrides?.appRoot ?? join(libDir, '..')
  const stationsPath =
    overrides?.stationsPath ?? join(appRoot, MPZ_STATIONS_REL)
  const backupPath =
    overrides?.backupPath ?? `${stationsPath}.bak`
  return { appRoot, stationsPath, backupPath }
}

export function canonicalizeStationsFile(data: StationsFile): StationsFile {
  const order = new Map(HUB_SLUG_ORDER.map((slug, index) => [slug, index]))
  const stations = [...data.stations].sort((a, b) => {
    const ai = order.get(a.slug) ?? Number.MAX_SAFE_INTEGER
    const bi = order.get(b.slug) ?? Number.MAX_SAFE_INTEGER
    return ai - bi
  })
  return { stations }
}

export function serializeStationsFile(data: StationsFile): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

async function writeAtomic(targetPath: string, content: string): Promise<void> {
  const dir = dirname(targetPath)
  const tmpPath = join(dir, `stations.json.${process.pid}.tmp`)
  try {
    await writeFile(tmpPath, content, 'utf8')
    await rename(tmpPath, targetPath)
  } catch (err) {
    try {
      if (existsSync(tmpPath)) {
        const { unlink } = await import('node:fs/promises')
        await unlink(tmpPath)
      }
    } catch {
      /* ignore cleanup failure */
    }
    throw new MpzContentIoError(
      'IO',
      err instanceof Error ? err.message : 'Atomares Schreiben fehlgeschlagen',
    )
  }
}

export function createMpzContentIo(overrides?: Partial<MpzContentIoPaths>): MpzContentIo {
  const paths = defaultPaths(overrides)

  return {
    getPaths: () => ({ ...paths }),

    async readStations(): Promise<StationsFile> {
      try {
        const raw = await readFile(paths.stationsPath, 'utf8')
        const parsed: unknown = JSON.parse(raw)
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !Array.isArray((parsed as StationsFile).stations)
        ) {
          throw new MpzContentIoError('IO', 'stations.json: ungültige Struktur (stations fehlt)')
        }
        return parsed as StationsFile
      } catch (err) {
        if (err instanceof MpzContentIoError) {
          throw err
        }
        if (err instanceof SyntaxError) {
          throw new MpzContentIoError('IO', `stations.json: ungültiges JSON — ${err.message}`)
        }
        throw new MpzContentIoError(
          'IO',
          err instanceof Error ? err.message : 'stations.json konnte nicht gelesen werden',
        )
      }
    },

    async writeStations(
      data: StationsFile,
      options: WriteStationsOptions = {},
    ): Promise<void> {
      const strict = options.strict !== false
      const validateAssets = options.validateAssets === true
      const canonicalize = options.canonicalize === true
      const makeBackup = options.makeBackup !== false

      if (strict) {
        try {
          validateStationsFile(data)
        } catch (err) {
          throw new MpzContentIoError(
            'VALIDATION',
            err instanceof Error ? err.message : 'Struktur-Validierung fehlgeschlagen',
          )
        }
      }

      if (validateAssets) {
        const { errors, warnings } = validateStationAssets(data, {
          appRoot: paths.appRoot,
        })
        for (const w of warnings) {
          console.warn(w)
        }
        if (errors.length > 0) {
          throw new MpzContentIoError(
            'VALIDATION',
            errors.join('\n'),
          )
        }
      }

      let payload = data
      if (canonicalize) {
        payload = canonicalizeStationsFile(data)
      }

      const serialized = serializeStationsFile(payload)

      if (makeBackup && existsSync(paths.stationsPath)) {
        try {
          await copyFile(paths.stationsPath, paths.backupPath)
        } catch (err) {
          throw new MpzContentIoError(
            'IO',
            err instanceof Error ? err.message : 'Backup konnte nicht erstellt werden',
          )
        }
      }

      await writeAtomic(paths.stationsPath, serialized)
    },
  }
}

const defaultIo = createMpzContentIo()

export function getStationsPaths(): MpzContentIoPaths {
  return defaultIo.getPaths()
}

export function readStations(): Promise<StationsFile> {
  return defaultIo.readStations()
}

export function writeStations(
  data: StationsFile,
  options?: WriteStationsOptions,
): Promise<void> {
  return defaultIo.writeStations(data, options)
}
