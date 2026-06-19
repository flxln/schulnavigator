import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import rawStations from '@/data/stations.json'
import {
  createMpzContentIo,
  resetMpzWriteLockForTests,
  serializeEmbedAllowlistFile,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import {
  MpzEmbedAllowlistError,
  normalizeEmbedAllowlistSuffixes,
  replaceEmbedAllowlist,
} from '@/lib/mpz-embed-allowlist'
import type { StationsFile } from '@/lib/types'
import type { EmbedAllowlistFile } from '@/lib/mpz-embed-allowlist-validation'

const stationsFixture = rawStations as StationsFile
const defaultAllowlist: EmbedAllowlistFile = {
  suffixes: ['bookcreator.com', 'delightex.com'],
}
const temps: string[] = []

function makeTempIo(
  allowlist: EmbedAllowlistFile = defaultAllowlist,
  stations: StationsFile = stationsFixture,
) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-embed-allowlist-'))
  temps.push(appRoot)
  const stationsPath = join(appRoot, 'data', 'stations.json')
  const allowlistPath = join(appRoot, 'data', 'embed-allowlist.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(stations), 'utf8')
  writeFileSync(allowlistPath, serializeEmbedAllowlistFile(allowlist), 'utf8')
  return createMpzContentIo({
    appRoot,
    stationsPath,
    backupPath: `${stationsPath}.bak`,
    allowlistPath,
    allowlistBackupPath: `${allowlistPath}.bak`,
  })
}

function readAllowlist(io: ReturnType<typeof makeTempIo>): EmbedAllowlistFile {
  return JSON.parse(
    readFileSync(io.getPaths().allowlistPath, 'utf8'),
  ) as EmbedAllowlistFile
}

afterEach(() => {
  resetMpzWriteLockForTests()
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('normalizeEmbedAllowlistSuffixes', () => {
  it('normalisiert, dedupliziert und sortiert', () => {
    expect(normalizeEmbedAllowlistSuffixes(['Delightex.com', 'bookcreator.com'])).toEqual([
      'bookcreator.com',
      'delightex.com',
    ])
  })

  it('wirft EMPTY_SUFFIXES', () => {
    expect(() => normalizeEmbedAllowlistSuffixes([])).toThrow(MpzEmbedAllowlistError)
  })

  it('wirft INVALID_SUFFIX', () => {
    expect(() => normalizeEmbedAllowlistSuffixes(['not-valid'])).toThrow(MpzEmbedAllowlistError)
  })

  it('wirft DUPLICATE_SUFFIX', () => {
    expect(() =>
      normalizeEmbedAllowlistSuffixes(['delightex.com', 'delightex.com']),
    ).toThrow(MpzEmbedAllowlistError)
  })
})

describe('replaceEmbedAllowlist', () => {
  it('schreibt neue Allowlist', async () => {
    const io = makeTempIo()
    const result = await replaceEmbedAllowlist(
      ['delightex.com', 'bookcreator.com', 'example.org'],
      io,
    )
    expect(result.suffixes).toEqual(['bookcreator.com', 'delightex.com', 'example.org'])
    expect(readAllowlist(io).suffixes).toEqual([
      'bookcreator.com',
      'delightex.com',
      'example.org',
    ])
  })

  it('rollback wenn stations.json embed.quelle verletzt', async () => {
    const io = makeTempIo()
    await expect(
      replaceEmbedAllowlist(['bookcreator.com'], io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })

    expect(readAllowlist(io).suffixes).toEqual(defaultAllowlist.suffixes)
  })
})
