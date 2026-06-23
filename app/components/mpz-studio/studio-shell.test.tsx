/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StudioShell } from '@/components/mpz-studio/studio-shell'

const mocks = vi.hoisted(() => ({
  dirty: false,
  loading: true,
  error: null as string | null,
  saveFeedback: null,
  saveAndValidate: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/mpz/studio',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/mpz-studio/plan-a-banner', () => ({
  PlanABanner: () => null,
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    report: null,
    loading: mocks.loading,
    dirty: mocks.dirty,
    error: mocks.error,
    saveFeedback: mocks.saveFeedback,
    applyReport: vi.fn(),
    markDirty: vi.fn(),
    validateNow: vi.fn(),
    saveAndValidate: mocks.saveAndValidate,
    clearSaveFeedback: vi.fn(),
  }),
}))

afterEach(() => cleanup())

describe('StudioShell SaveControl', () => {
  it('deaktiviert Speichern während loading', () => {
    mocks.loading = true
    mocks.dirty = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const btn = screen.getByRole('button', { name: 'Prüft Struktur und Dateien…' })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('zeigt Dirty-Punkt mobil bei dirty und nicht loading', () => {
    mocks.loading = false
    mocks.dirty = true
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const dots = container.querySelectorAll('.bg-warn.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(1)
    const saveBtn = screen.getByRole('button', { name: 'Speichern & Validieren' })
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('zeigt Context-Fehler als Alert unter dem Header', () => {
    mocks.loading = false
    mocks.dirty = false
    mocks.error = 'Zuerst /mpz/unlock aufrufen.'
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    expect(screen.getByRole('alert').textContent).toContain('/mpz/unlock')
  })
})
