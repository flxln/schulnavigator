/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TextViewer } from '@/components/media/text-viewer'

function mockFetch(options: {
  ok?: boolean
  redirected?: boolean
  contentType?: string
  body?: string
}) {
  const { ok = true, redirected = false, contentType = 'text/markdown', body = '' } = options
  return vi.fn().mockResolvedValue({
    ok,
    redirected,
    headers: {
      get: (key: string) => (key === 'content-type' ? contentType : null),
    },
    text: () => Promise.resolve(body),
  })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('TextViewer — Markdown (.md)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        contentType: 'text/markdown',
        body: '# Mein Schultag\n\nWillkommen!',
      }),
    )
  })

  it('rendert Markdown-Überschrift inline', async () => {
    render(<TextViewer src="/media/klassenzimmer/texte/grundschule_demo.md" />)
    const heading = await screen.findByText(/Mein Schultag/)
    expect(heading).toBeTruthy()
  })

  it('ruft fetch mit korrekter URL auf', async () => {
    render(<TextViewer src="/media/klassenzimmer/texte/grundschule_demo.md" />)
    await screen.findByText(/Mein Schultag/)
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      '/media/klassenzimmer/texte/grundschule_demo.md',
    )
  })
})

describe('TextViewer — Plaintext (.txt) mit Umlauten', () => {
  it('zeigt Plaintext-Inhalt mit Umlauten korrekt', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({
        contentType: 'text/plain',
        body: 'Schülerinnen und Schüler lernen täglich Neues. Übung macht den Meister.',
      }),
    )
    render(<TextViewer src="/demo/musik-info.txt" />)
    const el = await screen.findByText(/Schülerinnen und Schüler/)
    expect(el).toBeTruthy()
  })
})

describe('TextViewer — Fehlerfall', () => {
  it('zeigt Fehler bei nicht-ok-Response', async () => {
    vi.stubGlobal('fetch', mockFetch({ ok: false }))
    render(<TextViewer src="/demo/musik-info.txt" />)
    const msg = await screen.findByText(/konnte nicht geladen/)
    expect(msg).toBeTruthy()
  })

  it('zeigt Fehler bei redirected-Response (Guard)', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ redirected: true, contentType: 'text/html', body: '<html>Login</html>' }),
    )
    render(<TextViewer src="/demo/ssa-hinweis.txt" />)
    const msg = await screen.findByText(/konnte nicht geladen/)
    expect(msg).toBeTruthy()
  })

  it('zeigt Fehler bei HTML-Content-Type (Guard)', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch({ contentType: 'text/html', body: '<html>Eintrittseite</html>' }),
    )
    render(<TextViewer src="/demo/musik-info.txt" />)
    const msg = await screen.findByText(/konnte nicht geladen/)
    expect(msg).toBeTruthy()
  })

  it('zeigt Fehler bei unbekannter Dateiendung', async () => {
    vi.stubGlobal('fetch', mockFetch({ contentType: 'application/pdf', body: '%PDF' }))
    render(<TextViewer src="/demo/dokument.pdf" />)
    const msg = await screen.findByText(/konnte nicht geladen/)
    expect(msg).toBeTruthy()
  })
})
