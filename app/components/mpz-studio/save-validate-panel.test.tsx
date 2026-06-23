/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SaveValidatePanel } from '@/components/mpz-studio/save-validate-panel'

afterEach(() => cleanup())

describe('SaveValidatePanel', () => {
  it('rendert running-Banner ohne feedback und ohne Schließen', () => {
    render(
      <SaveValidatePanel running feedback={null} onDismiss={vi.fn()} />,
    )
    expect(screen.getByRole('status').textContent).toContain(
      'Speichern & Validieren läuft',
    )
    expect(screen.queryByRole('button', { name: 'Schließen' })).toBeNull()
  })

  it('rendert success mit grünem Akzent', () => {
    const { container } = render(
      <SaveValidatePanel
        feedback={{ ok: true, rolledBack: false, saved: true }}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByRole('status').textContent).toContain(
      'Validierung erfolgreich',
    )
    expect(container.innerHTML).toContain('border-l-accent')
    expect(container.innerHTML).toContain('bg-accent/5')
  })

  it('rendert rollback-error', () => {
    const { container } = render(
      <SaveValidatePanel
        feedback={{ ok: false, rolledBack: true, saved: false }}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert').textContent).toContain('zurückgerollt')
    expect(container.innerHTML).toContain('border-l-error')
  })

  it('rendert problems mit einheitlichem Error-Tint', () => {
    const { container } = render(
      <SaveValidatePanel
        feedback={{ ok: false, rolledBack: false, saved: true }}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert').textContent).toContain('Details im Dashboard')
    expect(container.innerHTML).toContain('border-l-error')
    expect(container.innerHTML).toContain('bg-error/5')
  })

  it('ruft onDismiss beim Schließen auf', () => {
    const onDismiss = vi.fn()
    render(
      <SaveValidatePanel
        feedback={{ ok: true, rolledBack: false, saved: false }}
        onDismiss={onDismiss}
      />,
    )
    screen.getByRole('button', { name: 'Schließen' }).click()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('gibt null zurück wenn weder running noch feedback', () => {
    const { container } = render(
      <SaveValidatePanel feedback={null} onDismiss={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
