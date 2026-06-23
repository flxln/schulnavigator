/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MpzDraftNotice, MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'

afterEach(() => cleanup())

describe('MpzFormAlert', () => {
  it('rendert error mit role=alert', () => {
    render(<MpzFormAlert variant="error">Fehlertext</MpzFormAlert>)
    expect(screen.getByRole('alert').textContent).toContain('Fehlertext')
  })

  it('rendert success mit role=status', () => {
    render(<MpzFormAlert variant="success">Gespeichert</MpzFormAlert>)
    expect(screen.getByRole('status').textContent).toContain('Gespeichert')
  })

  it('rendert info mit role=status und Titel', () => {
    render(
      <MpzFormAlert variant="info" title="Hinweis">
        Details
      </MpzFormAlert>,
    )
    const status = screen.getByRole('status')
    expect(status.textContent).toContain('Hinweis')
    expect(status.textContent).toContain('Details')
  })
})

describe('MpzDraftNotice', () => {
  it('rendert Standardtext mit role=status', () => {
    render(<MpzDraftNotice />)
    expect(screen.getByRole('status').textContent).toContain('Speichern')
  })

  it('akzeptiert benutzerdefinierten Text', () => {
    render(<MpzDraftNotice>Entwurf offen</MpzDraftNotice>)
    expect(screen.getByRole('status').textContent).toContain('Entwurf offen')
  })
})
