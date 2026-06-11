/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmbedViewer } from '@/components/media/embed-viewer'

const mockOpen = vi.fn()
const allowlist = ['delightex.com']

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_EMBED_ENABLED', 'true')
  vi.stubGlobal('open', mockOpen)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('EmbedViewer', () => {
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
    expect(screen.getByText('3D-Welt')).toBeTruthy()
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
})
