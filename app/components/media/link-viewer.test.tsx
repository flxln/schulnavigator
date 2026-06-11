/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LinkViewer } from '@/components/media/link-viewer'

const mockOpen = vi.fn()

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('LinkViewer — reguläre URL', () => {
  it('zeigt Hinweis und Hostname', () => {
    render(
      <LinkViewer
        url="https://example.com/path"
        label="Demo-Link"
      />,
    )
    expect(
      screen.getByText(/Sie verlassen die Schulnavigator-App/i),
    ).toBeTruthy()
    expect(screen.getByText('example.com')).toBeTruthy()
    expect(screen.getByText('Demo-Link')).toBeTruthy()
  })

  it('öffnet URL bei Button-Klick', () => {
    vi.stubGlobal('open', mockOpen)
    render(<LinkViewer url="https://example.com/demo" />)
    fireEvent.click(screen.getByRole('button', { name: /Im Browser öffnen/i }))
    expect(mockOpen).toHaveBeenCalledWith(
      'https://example.com/demo',
      '_blank',
      'noopener,noreferrer',
    )
  })
})

describe('LinkViewer — Delightex-URL', () => {
  it('zeigt Delightex-Fallback-Panel statt generischem Text', () => {
    render(<LinkViewer url="https://edu.delightex.com/WVX-NAQ" label="3D-Welt" />)
    expect(
      screen.queryByText(/Sie verlassen die Schulnavigator-App/i),
    ).toBeNull()
    expect(screen.getByText(/3D-Welt öffnet sich in einem neuen Tab/i)).toBeTruthy()
    expect(screen.getByText('3D-Welt')).toBeTruthy()
  })

  it('zeigt Browser-Button im Fallback-Panel', () => {
    vi.stubGlobal('open', mockOpen)
    render(<LinkViewer url="https://edu.delightex.com/WVX-NAQ" />)
    fireEvent.click(screen.getByRole('button', { name: /Im Browser öffnen/i }))
    expect(mockOpen).toHaveBeenCalledWith(
      'https://edu.delightex.com/WVX-NAQ',
      '_blank',
      'noopener,noreferrer',
    )
  })
})
