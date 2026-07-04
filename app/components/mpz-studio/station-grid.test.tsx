/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StationGrid } from '@/components/mpz-studio/station-grid'
import type {
  MpzStationOverview,
  MpzValidationReport,
} from '@/lib/mpz-studio-overview'

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
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
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

function station(partial: Partial<MpzStationOverview> & Pick<MpzStationOverview, 'slug' | 'hubNr' | 'titel'>): MpzStationOverview {
  return {
    viewer: 'flat',
    medienCount: 1,
    hotspotCount: 1,
    hasDialog: false,
    hasBild: true,
    hasPanorama360: false,
    health: 'ok',
    issues: [],
    ...partial,
  }
}

const sampleSummaries: MpzStationOverview[] = [
  station({ slug: 'klassenzimmer', hubNr: 1, titel: 'Klassenzimmer', health: 'ok' }),
  station({
    slug: 'speiseraum',
    hubNr: 8,
    titel: 'Speiseraum',
    health: 'warn',
    issues: ['Keine Medien'],
  }),
  station({
    slug: 'kunst',
    hubNr: 4,
    titel: 'Kunst',
    health: 'error',
    issues: ['Kein Raumbild (bild)'],
    hasBild: false,
  }),
  station({
    slug: 'musik',
    hubNr: 2,
    titel: 'Musik',
    viewer: 'equirectangular',
    hasPanorama360: true,
    health: 'ok',
  }),
]

const sampleReport: MpzValidationReport = {
  ok: false,
  checkedAt: '2026-06-23T10:00:00.000Z',
  durationMs: 42,
  errors: [],
  warnings: [],
  bySlug: {},
  stationsModifiedAt: '2026-06-23T09:00:00.000Z',
  stationSummaries: sampleSummaries,
}

beforeEach(() => {
  mocks.report = null
  mocks.loading = true
  mocks.saveInProgress = false
  mocks.error = null
})

afterEach(() => cleanup())

describe('StationGrid', () => {
  it('zeigt Skeleton beim Initial-Load', () => {
    const { container } = render(<StationGrid />)
    expect(screen.getByRole('heading', { name: 'Stationen' })).toBeTruthy()
    expect(container.querySelectorAll('.animate-pulse').length).toBe(12)
    expect(screen.queryByText('Klassenzimmer')).toBeNull()
  })

  it('nutzt MpzCard und semantische Ampel-Klassen', () => {
    mocks.report = sampleReport
    mocks.loading = false
    const { container } = render(<StationGrid />)
    expect(container.innerHTML).toContain('rounded-mpz-card')
    expect(container.innerHTML).not.toContain('shadow-gs39-sm')
    expect(container.querySelector('.bg-accent')).toBeTruthy()
    expect(container.querySelector('.bg-warn')).toBeTruthy()
    expect(container.querySelector('.bg-error')).toBeTruthy()
    expect(container.innerHTML).not.toContain('bg-brand-green')
  })

  it('zeigt Issues nur bei warn/error', () => {
    mocks.report = sampleReport
    mocks.loading = false
    render(<StationGrid />)
    expect(screen.getByText('— Keine Medien')).toBeTruthy()
    expect(screen.getByText('— Kein Raumbild (bild)')).toBeTruthy()
    const klassenzimmerCard = screen.getByRole('heading', {
      level: 2,
      name: 'Klassenzimmer',
    }).closest('.rounded-mpz-card')
    expect(klassenzimmerCard?.textContent).not.toContain('— Keine Medien')
  })

  it('rendert Stretched-Link und Footer-URLs', () => {
    mocks.report = sampleReport
    mocks.loading = false
    render(<StationGrid />)
    const bearbeitenLinks = screen.getAllByRole('link', {
      name: 'Klassenzimmer bearbeiten',
    })
    expect(bearbeitenLinks).toHaveLength(2)
    const stretchLink = bearbeitenLinks.find((link) =>
      link.className.includes('absolute inset-0'),
    )
    expect(stretchLink?.getAttribute('href')).toBe('/mpz/studio/stationen/klassenzimmer')

    const vorschau = screen.getByRole('link', { name: /Vorschau \/raum\/musik/ })
    expect(vorschau.getAttribute('href')).toBe('/raum/musik')
    expect(vorschau.hasAttribute('target')).toBe(false)

    const kalib = screen.getByRole('link', {
      name: /Kalibrieren \(Hotspots \+ Startblick\)/,
    })
    expect(kalib.getAttribute('href')).toBe('/mpz/calib/sphere/musik')

    const medienLinks = screen.getAllByRole('link', { name: 'Medien hochladen' })
    expect(medienLinks.some((l) => l.getAttribute('href')?.includes('tab=medien'))).toBe(
      true,
    )
  })

  it('zeigt keinen Kalibrier-Link ohne Panorama/Bild', () => {
    mocks.report = {
      ...sampleReport,
      stationSummaries: [sampleSummaries[2]!],
    }
    mocks.loading = false
    render(<StationGrid />)
    expect(screen.queryByRole('link', { name: /Kalibrier/ })).toBeNull()
  })

  it('zeigt sr-only Health-Labels', () => {
    mocks.report = sampleReport
    mocks.loading = false
    render(<StationGrid />)
    expect(screen.getAllByText('— Bereit').length).toBeGreaterThan(0)
    expect(screen.getByText('— Warnung')).toBeTruthy()
    expect(screen.getByText('— Fehler')).toBeTruthy()
  })

  it('behält Karten während Re-Validierung gemountet', () => {
    mocks.report = sampleReport
    mocks.loading = true
    render(<StationGrid />)
    expect(screen.getByRole('heading', { level: 2, name: 'Kunst' })).toBeTruthy()
    expect(screen.queryByText('Laden…')).toBeNull()
  })

  it('zeigt Unlock-Hinweis bei Context-Fehler', () => {
    mocks.error = 'Zuerst /mpz/unlock aufrufen.'
    mocks.loading = false
    render(<StationGrid />)
    expect(screen.getByText(/Zuerst \/mpz\/unlock/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Entsperren' }).getAttribute('href')).toBe(
      '/mpz/unlock',
    )
  })
})
