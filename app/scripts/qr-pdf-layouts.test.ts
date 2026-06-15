import { describe, expect, it } from 'vitest'
import {
  buildA4GridPdf,
  chunk,
  GRID_ITEMS_PER_PAGE,
  pageCountForItems,
  TWO_UP_ITEMS_PER_PAGE,
} from './qr-pdf-layouts'
import { toPrintItems } from './qr-print-items'

const sampleManifest = {
  entries: [
    {
      file: 'entry-fest.png',
      url: 'https://example.test/eintritt?t=fest-2026',
      token: 'fest-2026',
      mode: 'fest' as const,
    },
    {
      file: 'entry-heft.png',
      url: 'https://example.test/eintritt?t=heft-2026',
      token: 'heft-2026',
      mode: 'heft' as const,
    },
  ],
  rooms: [
    {
      file: 'raum-turnhalle.png',
      url: 'https://example.test/raum/turnhalle',
      slug: 'turnhalle',
      titel: 'Turnhalle',
    },
    {
      file: 'raum-werken.png',
      url: 'https://example.test/raum/werken',
      slug: 'werken',
      titel: 'Werken',
    },
    {
      file: 'raum-speiseraum.png',
      url: 'https://example.test/raum/speiseraum',
      slug: 'speiseraum',
      titel: 'Speiseraum',
    },
    {
      file: 'raum-musik.png',
      url: 'https://example.test/raum/musik',
      slug: 'musik',
      titel: 'Musikraum',
    },
    {
      file: 'raum-klassenzimmer.png',
      url: 'https://example.test/raum/klassenzimmer',
      slug: 'klassenzimmer',
      titel: 'Klassenzimmer',
    },
    {
      file: 'raum-lesewelt.png',
      url: 'https://example.test/raum/lesewelt',
      slug: 'lesewelt',
      titel: 'Lesewelt',
    },
  ],
}

const minimalPng = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
])

describe('chunk', () => {
  it('teilt 8 Items in 2er-Blöcke für 2up', () => {
    const items = Array.from({ length: 8 }, (_, i) => i)
    expect(chunk(items, TWO_UP_ITEMS_PER_PAGE)).toHaveLength(4)
    expect(chunk(items, TWO_UP_ITEMS_PER_PAGE)[0]).toEqual([0, 1])
  })

  it('berechnet Seitenanzahl für 8 Items', () => {
    expect(pageCountForItems(8, TWO_UP_ITEMS_PER_PAGE)).toBe(4)
    expect(pageCountForItems(8, GRID_ITEMS_PER_PAGE)).toBe(1)
  })
})

describe('toPrintItems', () => {
  it('mappt Entry-Subtitle und Raum label=slug', () => {
    const items = toPrintItems(sampleManifest)
    expect(items).toHaveLength(8)
    expect(items[0]).toMatchObject({
      id: 'entry-fest',
      label: 'entry-fest',
      subtitle: 'Eintritt Schulfest',
      kind: 'entry',
    })
    expect(items[1]).toMatchObject({
      id: 'entry-heft',
      subtitle: 'Eintritt Schulheft',
      kind: 'entry',
    })
    const roomItems = items.filter((i) => i.kind === 'room')
    expect(roomItems.map((r) => r.label)).toEqual([
      'klassenzimmer',
      'lesewelt',
      'musik',
      'speiseraum',
      'turnhalle',
      'werken',
    ])
    const turnhalle = roomItems.find((r) => r.label === 'turnhalle')
    expect(turnhalle?.subtitle).toBe('Turnhalle')
  })
})

describe('buildA4GridPdf', () => {
  it('erzeugt nicht-leere PDF-Bytes für ein Item', async () => {
    const items = toPrintItems({
      entries: [sampleManifest.entries[0]],
      rooms: [],
    })
    const buffers = new Map([[items[0].id, minimalPng]])
    const pdf = await buildA4GridPdf(items, buffers)
    expect(pdf.byteLength).toBeGreaterThan(0)
    expect(String.fromCharCode(...pdf.slice(0, 5))).toBe('%PDF-')
  })
})
