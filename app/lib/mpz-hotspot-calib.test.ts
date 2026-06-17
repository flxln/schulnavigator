import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import rawStations from '@/data/stations.json'
import { ingestDialogClip } from '@/lib/mpz-dialog-audio-ingest'
import { createMpzContentIo, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import {
  applyFlatHotspotCoords,
  applySphereHotspotCoords,
  MpzHotspotCalibError,
} from '@/lib/mpz-hotspot-calib'
import type { StationsFile } from '@/lib/types'

const baseFixture = rawStations as StationsFile
const temps: string[] = []

function makeFixtureWithKunstHotspot(): StationsFile {
  const data = structuredClone(baseFixture) as StationsFile
  const kunst = data.stations.find((s) => s.slug === 'kunst')
  if (!kunst) throw new Error('kunst missing')
  kunst.medien = [
    {
      id: 'kunst-demo',
      typ: 'foto',
      quelle: '/media/kunst/fotos/demo.jpg',
    },
  ]
  kunst.hotspots = [
    {
      id: 'hs-demo',
      label: 'Demo',
      x: 0.1,
      y: 0.5,
      mediumId: 'kunst-demo',
    },
  ]
  return data
}

function makeIo(fixture: StationsFile = makeFixtureWithKunstHotspot()) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-hotspot-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  const io = createMpzContentIo({ appRoot })
  writeFileSync(io.getPaths().stationsPath, JSON.stringify(fixture), 'utf8')
  return io
}

function readStationsFile(io: ReturnType<typeof createMpzContentIo>): StationsFile {
  return JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
}

const TEST_WAV = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0x24, 0, 0, 0]),
  Buffer.from('WAVEfmt '),
  Buffer.from('CLIP-TEST'),
  Buffer.alloc(1016, 0x20),
])

describe('mpz-hotspot-calib', () => {
  afterEach(() => {
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

  it('applyFlatHotspotCoords schreibt x/y', async () => {
    const io = makeIo()
    const result = await applyFlatHotspotCoords(
      { slug: 'kunst', hotspotId: 'hs-demo', x: 0.3412, y: 0.5123 },
      io,
    )
    expect(result).toEqual({
      hotspotId: 'hs-demo',
      x: 0.3412,
      y: 0.5123,
    })
    const data = readStationsFile(io)
    const hs = data.stations.find((s) => s.slug === 'kunst')?.hotspots?.[0]
    expect(hs?.x).toBe(0.3412)
    expect(hs?.y).toBe(0.5123)
  })

  it('applyFlatHotspotCoords lehnt Sphere-Station ab', async () => {
    const io = makeIo()
    await expect(
      applyFlatHotspotCoords(
        { slug: 'daz', hotspotId: 'hs-frieda', x: 0.5, y: 0.5 },
        io,
      ),
    ).rejects.toMatchObject({
      code: 'VALIDATION',
    } satisfies Partial<MpzHotspotCalibError>)
  })

  it('applySphereHotspotCoords normalisiert yaw und schreibt pitch', async () => {
    const io = makeIo()
    const result = await applySphereHotspotCoords(
      { slug: 'daz', hotspotId: 'hs-frieda', yaw: 190, pitch: -30.7 },
      io,
    )
    expect(result.yaw).toBe(-170)
    expect(result.pitch).toBe(-30.7)
    const data = readStationsFile(io)
    const hs = data.stations
      .find((s) => s.slug === 'daz')
      ?.hotspots360?.find((h) => h.id === 'hs-frieda')
    expect(hs?.yaw).toBe(-170)
    expect(hs?.pitch).toBe(-30.7)
  })

  it('applySphereHotspotCoords lehnt Flat-Station ab', async () => {
    const io = makeIo()
    await expect(
      applySphereHotspotCoords(
        { slug: 'kunst', hotspotId: 'hs-demo', yaw: 0, pitch: 0 },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('unbekannte Hotspot-ID → VALIDATION', async () => {
    const io = makeIo()
    await expect(
      applyFlatHotspotCoords(
        { slug: 'kunst', hotspotId: 'missing', x: 0.5, y: 0.5 },
        io,
      ),
    ).rejects.toBeInstanceOf(MpzHotspotCalibError)
  })

  it('serialisiert parallele Writes gegen Dialog-Ingest (geteilte Queue)', async () => {
    const io = makeIo()
    const root = io.getPaths().appRoot
    mkdirSync(join(root, 'content', 'dialog-audio', 'daz'), { recursive: true })
    resetMpzWriteLockForTests()

    await Promise.all([
      applyFlatHotspotCoords(
        { slug: 'kunst', hotspotId: 'hs-demo', x: 0.9, y: 0.1 },
        io,
      ),
      ingestDialogClip(
        {
          slug: 'daz',
          segmentIndex: 0,
          source: { buffer: TEST_WAV },
          originalName: 'test.wav',
          collision: 'replace',
        },
        io,
      ),
    ])

    const data = readStationsFile(io)
    const kunstHs = data.stations
      .find((s) => s.slug === 'kunst')
      ?.hotspots?.find((h) => h.id === 'hs-demo')
    expect(kunstHs).toMatchObject({ x: 0.9, y: 0.1 })
    const dazSeg = data.stations.find((s) => s.slug === 'daz')?.dialog?.segmente[0]
    expect(dazSeg?.quelle).toBe('/api/dialog/daz/01-frieda.wav')
  })
})
