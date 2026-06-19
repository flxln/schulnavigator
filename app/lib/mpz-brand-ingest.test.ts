import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMpzContentIo, resetMpzWriteLockForTests } from '@/lib/mpz-content-io'
import { ingestBrandAsset, listBrandManifest } from '@/lib/mpz-brand-ingest'
import {
  getBrandSlot,
  resolveBrandDestPath,
  validateBrandUpload,
} from '@/lib/mpz-brand-validation'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8')

const temps: string[] = []

function makeIo() {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-brand-ingest-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'public', 'brand', 'logos'), { recursive: true })
  mkdirSync(join(appRoot, 'public', 'brand', 'mascots'), { recursive: true })
  mkdirSync(join(appRoot, 'public', 'brand', 'motifs'), { recursive: true })
  return createMpzContentIo({ appRoot })
}

describe('mpz-brand-validation · resolveBrandDestPath', () => {
  it('löst bekannte Slots unter public/brand auf', () => {
    const appRoot = '/app'
    expect(resolveBrandDestPath(appRoot, 'logo-mpz')).toBe(
      join(appRoot, 'public', 'brand', 'logos', 'mpz-logo.png'),
    )
    expect(resolveBrandDestPath(appRoot, 'motif-bunting')).toBe(
      join(appRoot, 'public', 'brand', 'motifs', 'bunting.png'),
    )
  })
})

describe('mpz-brand-validation · validateBrandUpload', () => {
  it('akzeptiert SVG und PNG nach slot.accept', async () => {
    const svgSlot = getBrandSlot('logo-badge')!
    const pngSlot = getBrandSlot('mascot-frieda')!
    await expect(
      validateBrandUpload({
        slot: svgSlot,
        headerSlice: SVG,
        byteLength: SVG.length,
        originalName: 'ignored.svg',
      }),
    ).resolves.toBeUndefined()
    await expect(
      validateBrandUpload({
        slot: pngSlot,
        headerSlice: PNG,
        byteLength: PNG.length,
        originalName: 'ignored.png',
      }),
    ).resolves.toBeUndefined()
  })

  it('lehnt falschen Inhalt für slot.accept ab', async () => {
    const svgSlot = getBrandSlot('logo-badge')!
    await expect(
      validateBrandUpload({
        slot: svgSlot,
        headerSlice: PNG,
        byteLength: PNG.length,
        originalName: 'fake.svg',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('lehnt zu große Dateien ab', async () => {
    const slot = getBrandSlot('logo-badge')!
    await expect(
      validateBrandUpload({
        slot,
        headerSlice: SVG,
        byteLength: slot.maxBytes + 1,
        originalName: 'big.svg',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})

describe('mpz-brand-ingest · listBrandManifest', () => {
  afterEach(() => {
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  it('gibt exists:false für fehlende Motive zurück', async () => {
    const io = makeIo()
    writeFileSync(join(io.getPaths().appRoot, 'public', 'brand', 'logos', 'mpz-logo.png'), PNG)
    const { slots } = await listBrandManifest(io)
    const bunting = slots.find((s) => s.id === 'motif-bunting')
    expect(bunting).toMatchObject({
      exists: false,
      byteLength: null,
      mtime: null,
    })
    const mpz = slots.find((s) => s.id === 'logo-mpz')
    expect(mpz?.exists).toBe(true)
    expect(mpz?.byteLength).toBe(PNG.length)
    expect(mpz?.mtime).toMatch(/^\d{4}-/)
  })
})

describe('mpz-brand-ingest · ingestBrandAsset', () => {
  afterEach(() => {
    resetMpzWriteLockForTests()
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

  it('schreibt PNG-Maskottchen mit festem Pfad und mtime', async () => {
    const io = makeIo()
    const result = await ingestBrandAsset(
      {
        slotId: 'mascot-frieda',
        source: { buffer: PNG },
        originalName: 'AirDrop IMG.png',
      },
      io,
    )
    expect(result.path).toBe('/brand/mascots/frieda.png')
    expect(result.filename).toBe('frieda.png')
    expect(result.mtime).toMatch(/^\d{4}-/)
    expect(existsSync(result.destPath)).toBe(true)
    expect(readFileSync(result.destPath).equals(PNG)).toBe(true)
  })

  it('schreibt SVG-Logo unabhängig vom Upload-Namen', async () => {
    const io = makeIo()
    const result = await ingestBrandAsset(
      {
        slotId: 'logo-jubilaeum-lockup',
        source: { buffer: SVG },
        originalName: '../../evil.svg',
      },
      io,
    )
    expect(result.path).toBe('/brand/logos/jubilaeum-lockup.svg')
    expect(result.filename).toBe('jubilaeum-lockup.svg')
    expect(existsSync(result.destPath)).toBe(true)
  })

  it('replace überschreibt bestehende Datei', async () => {
    const io = makeIo()
    const other = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )
    const first = await ingestBrandAsset(
      {
        slotId: 'logo-mpz',
        source: { buffer: PNG },
        originalName: 'mpz.png',
      },
      io,
    )
    await ingestBrandAsset(
      {
        slotId: 'logo-mpz',
        source: { buffer: other },
        originalName: 'mpz.png',
      },
      io,
    )
    expect(existsSync(`${first.destPath}.bak`)).toBe(false)
    expect(readFileSync(first.destPath).equals(other)).toBe(true)
  })

  it('unbekannter Slot → VALIDATION', async () => {
    const io = makeIo()
    await expect(
      ingestBrandAsset(
        {
          slotId: 'unknown-slot',
          source: { buffer: PNG },
          originalName: 'a.png',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('Rollback bei IO-Fehler stellt vorherige Datei wieder her', async () => {
    const io = makeIo()
    const destPath = resolveBrandDestPath(io.getPaths().appRoot, 'logo-mpz')!
    writeFileSync(destPath, PNG)

    const mediumIngest = await import('@/lib/mpz-medium-ingest')
    vi.spyOn(mediumIngest, 'persistFile').mockRejectedValueOnce(new Error('disk full'))

    const other = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )

    await expect(
      ingestBrandAsset(
        {
          slotId: 'logo-mpz',
          source: { buffer: other },
          originalName: 'new.png',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'IO' })

    expect(readFileSync(destPath).equals(PNG)).toBe(true)
    vi.mocked(mediumIngest.persistFile).mockRestore()
  })
})
