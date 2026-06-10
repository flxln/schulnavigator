/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LinkViewer } from '@/components/media/link-viewer'

const mockOpen = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('LinkViewer', () => {
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
    vi.unstubAllGlobals()
  })
})
