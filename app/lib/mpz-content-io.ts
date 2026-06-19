import {
  copyFile,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { HUB_SLUG_MAP } from '@/lib/schoolhouse-hub-map'
import { validateCoachMessagesContent } from '@/lib/mpz-coach-messages-validation'
import {
  validateEmbedAllowlistContent,
  type EmbedAllowlistFile,
} from '@/lib/mpz-embed-allowlist-validation'
import {
  mergeValidationErrors,
  shouldRollbackPostValidate,
  validateStationsContent,
  type StationsContentValidation,
} from '@/lib/mpz-stations-validation'
import type { CoachMessage, CoachMessagesFile, StationsFile } from '@/lib/types'
import { validateStationsFile, assertUniqueStationSlugs } from '@/lib/validate-stations'
import { validateStationAssets } from '@/scripts/validate-station-assets'

export const MPZ_STATIONS_REL = 'data/stations.json'
export const MPZ_COACH_REL = 'content/coach-messages.json'
export const MPZ_EMBED_ALLOWLIST_REL = 'data/embed-allowlist.json'

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

export interface WriteCoachMessagesOptions {
  /** Default true */
  makeBackup?: boolean
  /** Inline-Validator vor rename; bei Fehler bleibt coach-messages.json unberührt */
  postValidate?: boolean
  stationCount: number
  stationSlugs: ReadonlySet<string>
}

export type WriteCoachMessagesResult = {
  mtime: string | null
}

export type CoachWriteResult = {
  messages: readonly CoachMessage[]
  mtime: string | null
}

export interface WriteEmbedAllowlistOptions {
  /** Default true */
  makeBackup?: boolean
  /** Inline-Validator + Cross-Check gegen stations.json vor rename */
  postValidate?: boolean
  /** Für Cross-Validate — aktueller Stand von stations.json */
  stationsFile: StationsFile
}

export type WriteEmbedAllowlistResult = {
  mtime: string | null
}

export type EmbedAllowlistWriteResult = {
  suffixes: readonly string[]
  mtime: string | null
}

export interface MpzContentIoPaths {
  appRoot: string
  stationsPath: string
  backupPath: string
  coachPath: string
  coachBackupPath: string
  allowlistPath: string
  allowlistBackupPath: string
}

export interface MpzContentIo {
  readStations(): Promise<StationsFile>
  writeStations(
    data: StationsFile,
    options?: WriteStationsOptions,
  ): Promise<WriteStationsResult>
  readCoachMessages(): Promise<CoachMessagesFile>
  writeCoachMessages(
    data: CoachMessagesFile,
    options: WriteCoachMessagesOptions,
  ): Promise<WriteCoachMessagesResult>
  readEmbedAllowlist(): Promise<EmbedAllowlistFile>
  writeEmbedAllowlist(
    data: EmbedAllowlistFile,
    options: WriteEmbedAllowlistOptions,
  ): Promise<WriteEmbedAllowlistResult>
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
  const coachPath =
    overrides?.coachPath ?? join(appRoot, MPZ_COACH_REL)
  const coachBackupPath =
    overrides?.coachBackupPath ?? `${coachPath}.bak`
  const allowlistPath =
    overrides?.allowlistPath ?? join(appRoot, MPZ_EMBED_ALLOWLIST_REL)
  const allowlistBackupPath =
    overrides?.allowlistBackupPath ?? `${allowlistPath}.bak`
  return {
    appRoot,
    stationsPath,
    backupPath,
    coachPath,
    coachBackupPath,
    allowlistPath,
    allowlistBackupPath,
  }
}

function tmpPathFor(targetPath: string): string {
  const dir = dirname(targetPath)
  const base = basename(targetPath)
  return join(dir, `${base}.${process.pid}.tmp`)
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

export function serializeCoachMessagesFile(data: CoachMessagesFile): string {
  return `${JSON.stringify(data, null, 2)}\n`
}

export function serializeEmbedAllowlistFile(data: EmbedAllowlistFile): string {
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

export async function writeAtomicFile(targetPath: string, content: string): Promise<void> {
  const tmpPath = tmpPathFor(targetPath)
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
  const tmpPath = tmpPathFor(paths.stationsPath)

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

async function commitCoachWrite(
  paths: MpzContentIoPaths,
  content: string,
  payload: CoachMessagesFile,
  stationCount: number,
  stationSlugs: ReadonlySet<string>,
): Promise<WriteCoachMessagesResult> {
  const tmpPath = tmpPathFor(paths.coachPath)

  try {
    await writeFile(tmpPath, content, 'utf8')

    const errors = validateCoachMessagesContent(payload, stationCount, stationSlugs)
    if (errors.length > 0) {
      await unlink(tmpPath)
      throw new MpzContentIoError('VALIDATION', errors.join('\n'))
    }

    await rename(tmpPath, paths.coachPath)
    return { mtime: await fileMtime(paths.coachPath) }
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

async function commitEmbedAllowlistWrite(
  paths: MpzContentIoPaths,
  content: string,
  payload: EmbedAllowlistFile,
  stationsFile: StationsFile,
): Promise<WriteEmbedAllowlistResult> {
  const tmpPath = tmpPathFor(paths.allowlistPath)

  try {
    await writeFile(tmpPath, content, 'utf8')

    const allowlistErrors = validateEmbedAllowlistContent(payload)
    if (allowlistErrors.length > 0) {
      await unlink(tmpPath)
      throw new MpzContentIoError('VALIDATION', allowlistErrors.join('\n'))
    }

    try {
      validateStationsFile(stationsFile, {
        embedAllowSuffixes: payload.suffixes,
      })
    } catch (err) {
      await unlink(tmpPath)
      throw new MpzContentIoError(
        'VALIDATION',
        err instanceof Error ? err.message : 'Cross-Validate stations.json fehlgeschlagen',
      )
    }

    await rename(tmpPath, paths.allowlistPath)
    return { mtime: await fileMtime(paths.allowlistPath) }
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

    async readCoachMessages(): Promise<CoachMessagesFile> {
      try {
        const raw = await readFile(paths.coachPath, 'utf8')
        const parsed: unknown = JSON.parse(raw)
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !Array.isArray((parsed as CoachMessagesFile).messages)
        ) {
          throw new MpzContentIoError(
            'IO',
            'coach-messages.json: ungültige Struktur (messages fehlt)',
          )
        }
        return parsed as CoachMessagesFile
      } catch (err) {
        if (err instanceof MpzContentIoError) {
          throw err
        }
        if (err instanceof SyntaxError) {
          throw new MpzContentIoError(
            'IO',
            `coach-messages.json: ungültiges JSON — ${err.message}`,
          )
        }
        throw new MpzContentIoError(
          'IO',
          err instanceof Error ? err.message : 'coach-messages.json konnte nicht gelesen werden',
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

      await writeAtomicFile(paths.stationsPath, serialized)
      return { mtime: await fileMtime(paths.stationsPath) }
    },

    async writeCoachMessages(
      data: CoachMessagesFile,
      options: WriteCoachMessagesOptions,
    ): Promise<WriteCoachMessagesResult> {
      const makeBackup = options.makeBackup !== false
      const postValidate = options.postValidate === true
      const serialized = serializeCoachMessagesFile(data)

      if (makeBackup && existsSync(paths.coachPath)) {
        try {
          await copyFile(paths.coachPath, paths.coachBackupPath)
        } catch (err) {
          throw new MpzContentIoError(
            'IO',
            err instanceof Error ? err.message : 'Coach-Backup konnte nicht erstellt werden',
          )
        }
      }

      if (postValidate) {
        return commitCoachWrite(
          paths,
          serialized,
          data,
          options.stationCount,
          options.stationSlugs,
        )
      }

      await writeAtomicFile(paths.coachPath, serialized)
      return { mtime: await fileMtime(paths.coachPath) }
    },

    async readEmbedAllowlist(): Promise<EmbedAllowlistFile> {
      try {
        const raw = await readFile(paths.allowlistPath, 'utf8')
        const parsed: unknown = JSON.parse(raw)
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !Array.isArray((parsed as EmbedAllowlistFile).suffixes)
        ) {
          throw new MpzContentIoError(
            'IO',
            'embed-allowlist.json: ungültige Struktur (suffixes fehlt)',
          )
        }
        return parsed as EmbedAllowlistFile
      } catch (err) {
        if (err instanceof MpzContentIoError) {
          throw err
        }
        if (err instanceof SyntaxError) {
          throw new MpzContentIoError(
            'IO',
            `embed-allowlist.json: ungültiges JSON — ${err.message}`,
          )
        }
        throw new MpzContentIoError(
          'IO',
          err instanceof Error ? err.message : 'embed-allowlist.json konnte nicht gelesen werden',
        )
      }
    },

    async writeEmbedAllowlist(
      data: EmbedAllowlistFile,
      options: WriteEmbedAllowlistOptions,
    ): Promise<WriteEmbedAllowlistResult> {
      const makeBackup = options.makeBackup !== false
      const postValidate = options.postValidate === true
      const serialized = serializeEmbedAllowlistFile(data)

      if (makeBackup && existsSync(paths.allowlistPath)) {
        try {
          await copyFile(paths.allowlistPath, paths.allowlistBackupPath)
        } catch (err) {
          throw new MpzContentIoError(
            'IO',
            err instanceof Error ? err.message : 'Allowlist-Backup konnte nicht erstellt werden',
          )
        }
      }

      if (postValidate) {
        return commitEmbedAllowlistWrite(
          paths,
          serialized,
          data,
          options.stationsFile,
        )
      }

      await writeAtomicFile(paths.allowlistPath, serialized)
      return { mtime: await fileMtime(paths.allowlistPath) }
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
