import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import rawStations from '@/data/stations.json'
import { createMpzContentIo, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import {
  applyFlatStartPan,
  applySphereStartView,
  MpzViewIngestError,
} from '@/lib/mpz-view-ingest'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'

const baseFixture = rawStations as StationsFile
const temps: string[] = []

function makeIo(fixture: StationsFile = structuredClone(baseFixture) as StationsFile) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-view-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  const io = createMpzContentIo({ appRoot })
  writeFileSync(io.getPaths().stationsPath, JSON.stringify(fixture), 'utf8')
  return io
}

function readStationsFile(io: ReturnType<typeof createMpzContentIo>): StationsFile {
  return JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
}

describe('mpz-view-ingest', () => {
  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetMpzWriteLockForTests()
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  it('applySphereStartView schreibt startYaw/startPitch', async () => {
    const io = makeIo()
    const result = await applySphereStartView(
      { slug: 'daz', startYaw: 42.3, startPitch: -12.7 },
      io,
    )
    expect(result).toEqual({
      slug: 'daz',
      startYaw: 42.3,
      startPitch: -12.7,
    })
    const station = readStationsFile(io).stations.find((s) => s.slug === 'daz')
    expect(station?.startYaw).toBe(42.3)
    expect(station?.startPitch).toBe(-12.7)
  })

  it('applySphereStartView normalisiert yaw', async () => {
    const io = makeIo()
    const result = await applySphereStartView(
      { slug: 'daz', startYaw: 190, startPitch: 0 },
      io,
    )
    expect(result.startYaw).toBe(-170)
  })

  it('applySphereStartView lehnt Flat-Station ab', async () => {
    const io = makeIo()
    await expect(
      applySphereStartView({ slug: 'kunst', startYaw: 0, startPitch: 0 }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' } satisfies Partial<MpzViewIngestError>)
  })

  it('applySphereStartView lehnt unbekannten slug ab', async () => {
    const io = makeIo()
    await expect(
      applySphereStartView({ slug: 'nicht-da', startYaw: 0, startPitch: 0 }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('applyFlatStartPan schreibt startPanX', async () => {
    const io = makeIo()
    const result = await applyFlatStartPan({ slug: 'kunst', startPanX: 0.4523 }, io)
    expect(result).toEqual({ slug: 'kunst', startPanX: 0.4523 })
    const station = readStationsFile(io).stations.find((s) => s.slug === 'kunst')
    expect(station?.startPanX).toBe(0.4523)
  })

  it('applyFlatStartPan akzeptiert startPanX 0', async () => {
    const io = makeIo()
    const result = await applyFlatStartPan({ slug: 'kunst', startPanX: 0 }, io)
    expect(result.startPanX).toBe(0)
    const station = readStationsFile(io).stations.find((s) => s.slug === 'kunst')
    expect(station?.startPanX).toBe(0)
  })

  it('applyFlatStartPan normalisiert via roundNorm', async () => {
    const io = makeIo()
    const result = await applyFlatStartPan({ slug: 'kunst', startPanX: 1.23456 }, io)
    expect(result.startPanX).toBe(1)
  })

  it('applyFlatStartPan lehnt Sphere-Station ab', async () => {
    const io = makeIo()
    await expect(
      applyFlatStartPan({ slug: 'daz', startPanX: 0.5 }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' } satisfies Partial<MpzViewIngestError>)
  })

  it('applyFlatStartPan lehnt nicht-finite startPanX ab', async () => {
    const io = makeIo()
    await expect(
      applyFlatStartPan({ slug: 'kunst', startPanX: Number.NaN }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('applyFlatStartPan lehnt unbekannten slug ab', async () => {
    const io = makeIo()
    await expect(
      applyFlatStartPan({ slug: 'nicht-da', startPanX: 0.5 }, io),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
