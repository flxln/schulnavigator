/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmbedViewer } from '@/components/media/embed-viewer'

const mockOpen = vi.fn()
const allowlist = ['delightex.com', 'bookcreator.com']

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_EMBED_ENABLED', 'true')
  vi.stubGlobal('open', mockOpen)
  // Standard: Desktop (pointer: fine) — kein Skip
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('EmbedViewer — Desktop (nicht-Mobile)', () => {
  it('rendert iframe bei gültiger Delightex-URL', () => {
    render(
      <EmbedViewer
        url="https://edu.delightex.com/share/demo"
        allowlist={allowlist}
        label="3D-Welt"
      />,
    )
    const iframe = document.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://edu.delightex.com/share/demo',
    )
  })

  it('zeigt Delightex-Fallback-Panel unter dem iframe', () => {
    render(
      <EmbedViewer
        url="https://edu.delightex.com/share/demo"
        allowlist={allowlist}
      />,
    )
    expect(document.querySelector('iframe')).not.toBeNull()
    expect(screen.getByText(/Im Browser öffnen/i)).toBeTruthy()
  })

  it('zeigt kein iframe bei blockierter URL', () => {
    render(
      <EmbedViewer url="https://example.com/x" allowlist={allowlist} />,
    )
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('öffnet Browser auch ohne Fehlerzustand', () => {
    render(
      <EmbedViewer
        url="https://edu.delightex.com/share/demo"
        allowlist={allowlist}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Im Browser öffnen/i }))
    expect(mockOpen).toHaveBeenCalledWith(
      'https://edu.delightex.com/share/demo',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('zeigt kein iframe wenn NEXT_PUBLIC_EMBED_ENABLED nicht true', () => {
    vi.stubEnv('NEXT_PUBLIC_EMBED_ENABLED', 'false')
    render(
      <EmbedViewer
        url="https://edu.delightex.com/share/demo"
        allowlist={allowlist}
      />,
    )
    expect(document.querySelector('iframe')).toBeNull()
    expect(screen.getByText(/vorübergehend deaktiviert/i)).toBeTruthy()
  })

  it('rendert iframe bei gültiger Book-Creator-URL mit allow-Attribut', () => {
    const url =
      'https://read.bookcreator.com/2MfAUZf5kWdGbFsdRTyW50qOUeT2/4GMz8K3eSy2Sv6RbTbo6_A'
    render(
      <EmbedViewer url={url} allowlist={allowlist} label="Berühmte Personen" />,
    )
    const iframe = document.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(url)
    expect(iframe?.getAttribute('allow')).toBe('clipboard-write')
    expect(iframe?.className).toContain('min-h-[70vh]')
    expect(screen.queryByText(/Inhalt eines Drittanbieters/i)).toBeNull()
    expect(screen.getByText(/Quelle:/i)).toBeTruthy()
    expect(screen.getByText('read.bookcreator.com')).toBeTruthy()
  })
})

describe('EmbedViewer — Mobile (pointer: coarse)', () => {
  beforeEach(() => {
    // Simuliert Touch-Gerät
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: coarse)',
    }))
  })

  it('rendert kein iframe auf Mobile bei Delightex-URL', () => {
    render(
      <EmbedViewer
        url="https://edu.delightex.com/WVX-NAQ"
        allowlist={allowlist}
        label="3D-Welt"
      />,
    )
    expect(document.querySelector('iframe')).toBeNull()
    expect(screen.getByText(/Die 3D-Welt braucht WebGL/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Im Browser öffnen/i })).toBeTruthy()
  })

  it('zeigt App-Store-Buttons auf Mobile', () => {
    // Simuliert Android
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 13)' })
    render(
      <EmbedViewer
        url="https://edu.delightex.com/WVX-NAQ"
        allowlist={allowlist}
      />,
    )
    expect(screen.getByRole('button', { name: /Delightex-App installieren/i })).toBeTruthy()
  })

  it('rendert iframe auf Mobile bei Book-Creator-URL', () => {
    render(
      <EmbedViewer
        url="https://read.bookcreator.com/2MfAUZf5kWdGbFsdRTyW50qOUeT2/4GMz8K3eSy2Sv6RbTbo6_A"
        allowlist={allowlist}
        label="Berühmte Personen"
      />,
    )
    expect(document.querySelector('iframe')).not.toBeNull()
    expect(screen.queryByText(/Die 3D-Welt braucht WebGL/i)).toBeNull()
  })
})
