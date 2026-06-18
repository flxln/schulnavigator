import {
  copyFile,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import {
  mergeValidationErrors,
  shouldRollbackPostValidate,
  validateStationsContent,
  type StationsContentValidation,
} from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'
import { validateStationsFile, assertUniqueStationSlugs } from '@/lib/validate-stations'
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
  /** tmp validieren vor rename; bei Fehler bleibt stations.json unberührt */
  postValidate?: boolean
  /** Rollback-Scope für Asset-Fehler (leer = voller Scope) */
  touchedSlugs?: string[]
}

export type WriteStationsResult = {
  mtime: string | null
  validation?: StationsContentValidation
}

export interface MpzContentIoPaths {
  appRoot: string
  stationsPath: string
  backupPath: string
}

export interface MpzContentIo {
  readStations(): Promise<StationsFile>
  writeStations(
    data: StationsFile,
    options?: WriteStationsOptions,
  ): Promise<WriteStationsResult>
  getPaths(): MpzContentIoPaths
  fileExists(absPath: string): boolean
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

async function fileMtime(path: string): Promise<string | null> {
  try {
    const info = await stat(path)
    return info.mtime.toISOString()
  } catch {
    return null
  }
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

async function commitStationsWrite(
  paths: MpzContentIoPaths,
  content: string,
  payload: StationsFile,
  touchedSlugs: string[] | undefined,
): Promise<WriteStationsResult> {
  const dir = dirname(paths.stationsPath)
  const tmpPath = join(dir, `stations.json.${process.pid}.tmp`)

  try {
    await writeFile(tmpPath, content, 'utf8')

    const validation = validateStationsContent(payload, paths.appRoot)
    if (shouldRollbackPostValidate(validation, touchedSlugs)) {
      await unlink(tmpPath)
      throw new MpzContentIoError(
        'VALIDATION',
        mergeValidationErrors(validation).join('\n') || 'Post-Validate fehlgeschlagen',
      )
    }

    await rename(tmpPath, paths.stationsPath)
    return {
      mtime: await fileMtime(paths.stationsPath),
      validation,
    }
  } catch (err) {
    if (existsSync(tmpPath)) {
      try {
        await unlink(tmpPath)
      } catch {
        /* ignore */
      }
    }
    if (err instanceof MpzContentIoError) {
      throw err
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

    fileExists(absPath: string): boolean {
      return existsSync(absPath)
    },

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
    ): Promise<WriteStationsResult> {
      const strict = options.strict !== false
      const validateAssets = options.validateAssets === true
      const canonicalize = options.canonicalize === true
      const makeBackup = options.makeBackup !== false
      const postValidate = options.postValidate === true
      const touchedSlugs = options.touchedSlugs

      try {
        assertUniqueStationSlugs(data.stations)
      } catch (err) {
        throw new MpzContentIoError(
          'VALIDATION',
          err instanceof Error ? err.message : 'Slug-Eindeutigkeit verletzt',
        )
      }

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

      if (postValidate) {
        return commitStationsWrite(paths, serialized, payload, touchedSlugs)
      }

      await writeAtomic(paths.stationsPath, serialized)
      return { mtime: await fileMtime(paths.stationsPath) }
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
): Promise<WriteStationsResult> {
  return defaultIo.writeStations(data, options)
}

let mpzWriteChain: Promise<void> = Promise.resolve()

/** Serialisiert parallele MPZ-Writes auf stations.json (Dialog-Ingest, Hotspot-Kalib, …). */
export function withMpzWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = mpzWriteChain.then(fn)
  mpzWriteChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

/** Nur für Tests: Write-Queue zurücksetzen. */
export function resetMpzWriteLockForTests(): void {
  mpzWriteChain = Promise.resolve()
}
