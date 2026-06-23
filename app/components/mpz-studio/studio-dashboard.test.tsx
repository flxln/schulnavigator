/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StudioDashboard } from '@/components/mpz-studio/studio-dashboard'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'

const mocks = vi.hoisted(() => ({
  report: null as MpzValidationReport | null,
  loading: true,
  saveInProgress: false,
  error: null as string | null,
  validateNow: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    report: mocks.report,
    loading: mocks.loading,
    saveInProgress: mocks.saveInProgress,
    error: mocks.error,
    dirty: false,
    saveFeedback: null,
    applyReport: vi.fn(),
    markDirty: vi.fn(),
    validateNow: mocks.validateNow,
    saveAndValidate: vi.fn(),
    clearSaveFeedback: vi.fn(),
  }),
}))

const sampleReport: MpzValidationReport = {
  ok: true,
  checkedAt: '2026-06-23T10:00:00.000Z',
  durationMs: 42,
  errors: [],
  warnings: [],
  bySlug: {},
  stationsModifiedAt: '2026-06-23T09:00:00.000Z',
  stationSummaries: [
    {
      slug: 'klassenzimmer',
      hubNr: 1,
      titel: 'Klassenzimmer',
      viewer: 'flat',
      medienCount: 2,
      hotspotCount: 1,
      hasDialog: false,
      hasBild: true,
      hasPanorama360: false,
      health: 'ok',
      issues: [],
    },
    {
      slug: 'kunst',
      hubNr: 2,
      titel: 'Kunst',
      viewer: 'flat',
      medienCount: 0,
      hotspotCount: 0,
      hasDialog: false,
      hasBild: false,
      hasPanorama360: false,
      health: 'error',
      issues: ['Kein Raumbild'],
    },
  ],
}

beforeEach(() => {
  mocks.report = null
  mocks.loading = true
  mocks.saveInProgress = false
  mocks.error = null
})

afterEach(() => cleanup())

describe('StudioDashboard', () => {
  it('zeigt Skeleton beim Initial-Load', () => {
    const { container } = render(<StudioDashboard />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
    expect(screen.queryByText('Alle Stationen valid')).toBeNull()
  })

  it('nutzt MpzCard und KPI-Zahlen bei geladenem Report', () => {
    mocks.report = sampleReport
    mocks.loading = false
    const { container } = render(<StudioDashboard />)
    expect(container.innerHTML).toContain('rounded-mpz-card')
    expect(container.innerHTML).not.toContain('shadow-gs39-sm')
    expect(container.querySelector('.text-brand-green')?.textContent).toBe('1')
    expect(container.querySelector('.text-brand-red')?.textContent).toBe('1')
  })

  it('zeigt Error-Hero mit rotem Streifen bei !report.ok', () => {
    mocks.report = { ...sampleReport, ok: false }
    mocks.loading = false
    const { container } = render(<StudioDashboard />)
    expect(container.innerHTML).toContain('border-l-error')
    expect(container.innerHTML).toContain('bg-error/5')
    expect(
      screen.getByRole('heading', { level: 2, name: /1 Fehler, 0 Warnungen/ }),
    ).toBeTruthy()
  })

  it('deaktiviert Erneut prüfen während saveInProgress', () => {
    mocks.report = sampleReport
    mocks.loading = true
    mocks.saveInProgress = true
    render(<StudioDashboard />)
    const btn = screen.getByRole('button', { name: 'Erneut prüfen' })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('behält KPIs während Re-Validierung gemountet', () => {
    mocks.report = sampleReport
    mocks.loading = true
    mocks.saveInProgress = false
    render(<StudioDashboard />)
    expect(screen.getByText('Valid')).toBeTruthy()
    expect(screen.queryByText('Laden…')).toBeNull()
  })
})
