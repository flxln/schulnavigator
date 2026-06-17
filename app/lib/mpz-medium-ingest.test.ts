import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import rawStations from '@/data/stations.json'
import { createMpzContentIo } from '@/lib/mpz-content-io'
import { ingestMediumFile, MpzUploadError } from '@/lib/mpz-medium-ingest'
import * as mpzStationsValidation from '@/lib/mpz-stations-validation'
import type { StationsFile } from '@/lib/types'

const fixture = rawStations as StationsFile

function pad(b: Buffer, n = 64): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, n - b.length))])
}
const JPEG = pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]))
const HEIC = pad(Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypheic'), Buffer.from([0, 0, 0, 0]), Buffer.from('heicmif1')]))

const temps: string[] = []

function makeIo() {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-ingest-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  const io = createMpzContentIo({ appRoot })
  // Echte, valide stations.json-Fixture (strict-Write erwartet 12 Stationen + intakte
  // hotspot360-Referenzen). Tests hängen nur NEUE Medien an und nutzen frische Dateinamen.
  writeFileSync(io.getPaths().stationsPath, JSON.stringify(fixture), 'utf8')
  return io
}

function readStationsFile(io: ReturnType<typeof createMpzContentIo>): StationsFile {
  return JSON.parse(readFileSync(io.getPaths().stationsPath, 'utf8')) as StationsFile
}

describe('mpz-medium-ingest · ingestMediumFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  beforeEach(() => {
    vi.spyOn(mpzStationsValidation, 'validateStationsContent').mockReturnValue({
      structureErrors: [],
      assetErrors: [],
      warnings: [],
      bySlug: {},
    })
  })

  it('schreibt Datei und Medium in JSON', async () => {
    const io = makeIo()
    const result = await ingestMediumFile(
      {
        slug: 'klassenzimmer',
        typ: 'foto',
        source: { buffer: JPEG },
        originalName: 'Mein Foto.jpg',
        untertitel: 'Hallo',
        collision: 'rename',
      },
      io,
    )
    expect(result.jsonWritten).toBe(true)
    expect(result.quelle).toBe('/media/klassenzimmer/fotos/mein-foto.jpg')
    expect(existsSync(result.destPath)).toBe(true)

    const data = readStationsFile(io)
    const station = data.stations.find((s) => s.slug === 'klassenzimmer')
    const added = station?.medien.find((m) => m.quelle === '/media/klassenzimmer/fotos/mein-foto.jpg')
    expect(added).toMatchObject({
      typ: 'foto',
      quelle: '/media/klassenzimmer/fotos/mein-foto.jpg',
      untertitel: 'Hallo',
    })
  })

  it('setzt videoSource=upload für Videos', async () => {
    const io = makeIo()
    const MP4 = pad(
      Buffer.concat([
        Buffer.from([0, 0, 0, 0x18]),
        Buffer.from('ftypisom'),
        Buffer.from([0, 0, 0, 0]),
        Buffer.from('isommp42'),
      ]),
    )
    const result = await ingestMediumFile(
      { slug: 'musik', typ: 'video', source: { buffer: MP4 }, originalName: 'clip.mp4', collision: 'rename' },
      io,
    )
    expect(result.medium.videoSource).toBe('upload')
  })

  it('benennt Datei bei Disk-Kollision um (-2)', async () => {
    const io = makeIo()
    const first = await ingestMediumFile(
      { slug: 'kunst', typ: 'foto', source: { buffer: JPEG }, originalName: 'bild.jpg', collision: 'rename' },
      io,
    )
    const second = await ingestMediumFile(
      { slug: 'kunst', typ: 'foto', source: { buffer: JPEG }, originalName: 'bild.jpg', collision: 'rename' },
      io,
    )
    expect(first.filename).toBe('bild.jpg')
    expect(second.filename).toBe('bild-2.jpg')
    expect(existsSync(first.destPath)).toBe(true)
    expect(existsSync(second.destPath)).toBe(true)
  })

  it('benennt medium.id bei Kollision um (auto-id)', async () => {
    const io = makeIo()
    const a = await ingestMediumFile(
      { slug: 'hort', typ: 'foto', source: { buffer: JPEG }, originalName: 'foto.jpg', collision: 'rename' },
      io,
    )
    const b = await ingestMediumFile(
      { slug: 'hort', typ: 'foto', source: { buffer: JPEG }, originalName: 'foto.jpg', collision: 'rename' },
      io,
    )
    expect(a.medium.id).toBe('hort-foto')
    // zweite Datei heißt foto-2.jpg → id hort-foto-2 (kollisionsfrei)
    expect(b.medium.id).not.toBe(a.medium.id)
  })

  it('reject bricht bei Disk-Kollision hart ab (CLI-Verhalten, Befund #5)', async () => {
    const io = makeIo()
    await ingestMediumFile(
      { slug: 'werken', typ: 'foto', source: { buffer: JPEG }, originalName: 'x.jpg', collision: 'reject' },
      io,
    )
    await expect(
      ingestMediumFile(
        { slug: 'werken', typ: 'foto', source: { buffer: JPEG }, originalName: 'x.jpg', collision: 'reject' },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('409-Pfad: explizite id-Kollision wirft COLLISION', async () => {
    const io = makeIo()
    await ingestMediumFile(
      { slug: 'daz', typ: 'foto', source: { buffer: JPEG }, originalName: 'a.jpg', id: 'fix-id', collision: 'rename' },
      io,
    )
    await expect(
      ingestMediumFile(
        { slug: 'daz', typ: 'foto', source: { buffer: JPEG }, originalName: 'b.jpg', id: 'fix-id', collision: 'rename' },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('lehnt HEIC ab, bevor eine Datei geschrieben wird', async () => {
    const io = makeIo()
    await expect(
      ingestMediumFile(
        { slug: 'kunst', typ: 'foto', source: { buffer: HEIC }, originalName: 'IMG.heic', collision: 'rename' },
        io,
      ),
    ).rejects.toBeInstanceOf(MpzUploadError)
    const destDir = join(io.getPaths().appRoot, 'public', 'media', 'kunst', 'fotos')
    expect(existsSync(destDir)).toBe(false)
  })

  it('Kompensation: löscht Datei, wenn JSON-Write fehlschlägt', async () => {
    const io = makeIo()
    // Ungültige stations.json (zu wenige Stationen) → strict-Write wirft.
    writeFileSync(
      io.getPaths().stationsPath,
      JSON.stringify({ stations: [{ slug: 'klassenzimmer', titel: 'x', beschreibung: 'y', medien: [] }] }),
      'utf8',
    )
    let destPath = ''
    try {
      await ingestMediumFile(
        { slug: 'klassenzimmer', typ: 'foto', source: { buffer: JPEG }, originalName: 'comp.jpg', collision: 'rename' },
        io,
      )
    } catch {
      destPath = join(io.getPaths().appRoot, 'public', 'media', 'klassenzimmer', 'fotos', 'comp.jpg')
    }
    expect(destPath).not.toBe('')
    expect(existsSync(destPath)).toBe(false)
  })

  it('skipJson schreibt nur die Datei, lässt JSON unverändert', async () => {
    const io = makeIo()
    const before = readStationsFile(io)
    const result = await ingestMediumFile(
      { slug: 'speiseraum', typ: 'foto', source: { buffer: JPEG }, originalName: 'nojson.jpg', collision: 'rename', skipJson: true },
      io,
    )
    expect(result.jsonWritten).toBe(false)
    expect(existsSync(result.destPath)).toBe(true)
    const after = readStationsFile(io)
    expect(JSON.stringify(after)).toBe(JSON.stringify(before))
  })

  it('lehnt unbekannten slug ab', async () => {
    const io = makeIo()
    await expect(
      ingestMediumFile(
        { slug: 'gibtsnicht', typ: 'foto', source: { buffer: JPEG }, originalName: 'a.jpg', collision: 'rename' },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
