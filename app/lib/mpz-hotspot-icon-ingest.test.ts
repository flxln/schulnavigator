import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createMpzContentIo, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import {
  ingestHotspotIcon,
  listStationHotspotIcons,
  resolveIconPublicPath,
  validateIconUpload,
} from '@/lib/mpz-hotspot-icon-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8')

const temps: string[] = []

function makeIo() {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-icon-ingest-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'public'), { recursive: true })
  return createMpzContentIo({ appRoot })
}

describe('mpz-hotspot-icon-ingest · resolveIconPublicPath', () => {
  it('akzeptiert Pfade unter media/icons/', () => {
    const appRoot = '/app'
    expect(resolveIconPublicPath(appRoot, 'hort', '/media/hort/icons/play.svg')).toBe(
      join(appRoot, 'public', 'media', 'hort', 'icons', 'play.svg'),
    )
  })

  it('akzeptiert Pfade unter stations-icons/', () => {
    const appRoot = '/app'
    expect(resolveIconPublicPath(appRoot, 'daz', '/stations-icons/daz/video.svg')).toBe(
      join(appRoot, 'public', 'stations-icons', 'daz', 'video.svg'),
    )
  })

  it('lehnt fotos/, falschen Slug und Traversal ab', () => {
    const appRoot = '/app'
    expect(resolveIconPublicPath(appRoot, 'hort', '/media/hort/fotos/x.jpg')).toBeNull()
    expect(resolveIconPublicPath(appRoot, 'hort', '/media/other/icons/x.svg')).toBeNull()
    expect(resolveIconPublicPath(appRoot, 'hort', '/stations-icons/other/x.svg')).toBeNull()
    expect(
      resolveIconPublicPath(appRoot, 'hort', '/media/hort/icons/../../../config.json'),
    ).toBeNull()
    expect(
      resolveIconPublicPath(
        appRoot,
        'hort',
        '/stations-icons/hort/../../../config.json',
      ),
    ).toBeNull()
  })
})

describe('mpz-hotspot-icon-ingest · validateIconUpload', () => {
  it('akzeptiert SVG und PNG', async () => {
    await expect(
      validateIconUpload({ headerSlice: SVG, byteLength: SVG.length, originalName: 'a.svg' }),
    ).resolves.toBeUndefined()
    await expect(
      validateIconUpload({ headerSlice: PNG, byteLength: PNG.length, originalName: 'a.png' }),
    ).resolves.toBeUndefined()
  })

  it('lehnt leere und zu große Dateien ab', async () => {
    await expect(
      validateIconUpload({ headerSlice: Buffer.alloc(0), byteLength: 0, originalName: 'a.svg' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(
      validateIconUpload({
        headerSlice: SVG,
        byteLength: 3 * 1024 * 1024,
        originalName: 'a.svg',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('mpz-hotspot-icon-ingest · ingestHotspotIcon', () => {
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

  it('schreibt PNG nach icons/ mit öffentlichem Pfad', async () => {
    const io = makeIo()
    const result = await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: PNG },
        originalName: 'Mein Icon.png',
        collision: 'reject',
      },
      io,
    )
    expect(result.path).toBe('/media/hort/icons/mein-icon.png')
    expect(existsSync(result.destPath)).toBe(true)
    expect(readFileSync(result.destPath).equals(PNG)).toBe(true)
  })

  it('schreibt SVG mit Traversal-sicherem Dateinamen', async () => {
    const io = makeIo()
    const result = await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: SVG },
        originalName: '../../evil.svg',
        collision: 'reject',
      },
      io,
    )
    expect(result.filename).toBe('evil.svg')
    expect(result.path).toBe('/media/hort/icons/evil.svg')
    expect(existsSync(result.destPath)).toBe(true)
    expect(existsSync(join(io.getPaths().appRoot, 'public', 'media', 'evil.svg'))).toBe(false)
  })

  it('lehnt Upload ab wenn Bahn-A-Preset kollidiert', async () => {
    const io = makeIo()
    const presetDir = join(io.getPaths().appRoot, 'public', 'stations-icons', 'hort')
    mkdirSync(presetDir, { recursive: true })
    writeFileSync(join(presetDir, 'video.svg'), SVG)
    await expect(
      ingestHotspotIcon(
        {
          slug: 'hort',
          source: { buffer: SVG },
          originalName: 'video.svg',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({
      code: 'VALIDATION',
      message: expect.stringContaining('generisches Preset'),
    })
  })

  it('COLLISION bei reject wenn Datei existiert', async () => {
    const io = makeIo()
    await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: PNG },
        originalName: 'play.png',
        collision: 'reject',
      },
      io,
    )
    await expect(
      ingestHotspotIcon(
        {
          slug: 'hort',
          source: { buffer: PNG },
          originalName: 'play.png',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })

  it('replace überschreibt und entfernt .bak nach Erfolg', async () => {
    const io = makeIo()
    const first = await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: PNG },
        originalName: 'play.png',
        collision: 'reject',
      },
      io,
    )
    const other = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: other },
        originalName: 'play.png',
        collision: 'replace',
      },
      io,
    )
    expect(existsSync(`${first.destPath}.bak`)).toBe(false)
    expect(readFileSync(first.destPath).equals(other)).toBe(true)
  })

  it('listStationHotspotIcons liefert sortierte Pfade aus Bahn A und B', async () => {
    const io = makeIo()
    const presetDir = join(io.getPaths().appRoot, 'public', 'stations-icons', 'hort')
    mkdirSync(presetDir, { recursive: true })
    writeFileSync(join(presetDir, 'preset.svg'), SVG)
    await ingestHotspotIcon(
      {
        slug: 'hort',
        source: { buffer: PNG },
        originalName: 'a.png',
        collision: 'reject',
      },
      io,
    )
    const { paths } = await listStationHotspotIcons('hort', io)
    expect(paths).toEqual([
      '/media/hort/icons/a.png',
      '/stations-icons/hort/preset.svg',
    ])
  })

  it('listStationHotspotIcons → leer wenn Ordner fehlt', async () => {
    const io = makeIo()
    const { paths } = await listStationHotspotIcons('hort', io)
    expect(paths).toEqual([])
  })

  it('unbekannter slug → VALIDATION', async () => {
    const io = makeIo()
    await expect(
      ingestHotspotIcon(
        {
          slug: 'unbekannt',
          source: { buffer: SVG },
          originalName: 'a.svg',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
    await expect(listStationHotspotIcons('unbekannt', io)).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })
})
