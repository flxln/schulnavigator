/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PhotoViewer } from '@/components/media/photo-viewer'

afterEach(() => cleanup())

describe('PhotoViewer', () => {
  it('zeigt Bild', () => {
    render(<PhotoViewer src="/demo/foto.jpg" alt="Testbild" />)
    expect(screen.getByRole('img', { name: 'Testbild' })).toBeTruthy()
  })

  it('öffnet Vollbild bei Klick auf Vergrößern-Button', () => {
    render(<PhotoViewer src="/demo/foto.jpg" alt="Testbild" />)
    const btn = screen.getByRole('button', { name: /vergrößern/i })
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: /vollbild schließen/i })).toBeTruthy()
  })

  it('schließt Vollbild bei Klick auf Schließen-Button', () => {
    render(<PhotoViewer src="/demo/foto.jpg" />)
    fireEvent.click(screen.getByRole('button', { name: /vergrößern/i }))
    const closeBtn = screen.getByRole('button', { name: /vollbild schließen/i })
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('button', { name: /vollbild schließen/i })).toBeNull()
  })

  it('schließt Vollbild bei Escape-Taste', () => {
    render(<PhotoViewer src="/demo/foto.jpg" />)
    fireEvent.click(screen.getByRole('button', { name: /vergrößern/i }))
    expect(screen.getByRole('button', { name: /vollbild schließen/i })).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('button', { name: /vollbild schließen/i })).toBeNull()
  })
})
