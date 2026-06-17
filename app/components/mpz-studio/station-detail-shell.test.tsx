/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDetailShell } from '@/components/mpz-studio/station-detail-shell'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'
import { getStationBySlug } from '@/lib/stations'

const mocks = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  report: null as MpzValidationReport | null,
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
  useRouter: () => ({ refresh: vi.fn() }),
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

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    report: mocks.report,
    loading: false,
    dirty: false,
    error: null,
    saveFeedback: null,
    applyReport: vi.fn(),
    markDirty: vi.fn(),
    validateNow: vi.fn(),
    saveAndValidate: vi.fn(),
    clearSaveFeedback: vi.fn(),
  }),
  markMpzStudioDirty: vi.fn(),
}))

function summaryForSlug(slug: string, hasDialog: boolean) {
  const station = getStationBySlug(slug)
  return {
    slug,
    hubNr: 1,
    titel: station?.titel ?? slug,
    viewer: station?.viewer ?? 'flat',
    medienCount: station?.medien?.length ?? 0,
    hotspotCount:
      (station?.hotspots?.length ?? 0) + (station?.hotspots360?.length ?? 0),
    hasDialog,
    hasBild: !!station?.bild,
    health: 'ok' as const,
    issues: [] as string[],
  }
}

function setReport(slug: string, hasDialog: boolean) {
  mocks.report = {
    ok: true,
    checkedAt: new Date().toISOString(),
    durationMs: 1,
    errors: [],
    warnings: [],
    bySlug: {},
    stationsModifiedAt: null,
    stationSummaries: [summaryForSlug(slug, hasDialog)],
  }
}

afterEach(() => {
  cleanup()
  mocks.searchParams = new URLSearchParams()
  mocks.report = null
})

describe('StationDetailShell', () => {
  it('rendert drei Tabs ohne Dialog für klassenzimmer', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} />,
    )

    expect(screen.getByRole('link', { name: 'Stammdaten' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Medien/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Hotspots/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Dialog-Audio' })).toBeNull()
  })

  it('rendert Dialog-Audio-Tab für daz wenn hasDialog', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('daz', true)
    const station = getStationBySlug('daz')!

    render(<StationDetailShell station={station} slug="daz" hubNr={3} />)

    expect(screen.getByRole('link', { name: 'Dialog-Audio' })).toBeTruthy()
  })

  it('Tab-Links enthalten korrektes ?tab=', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} />,
    )

    expect(screen.getByRole('link', { name: /Medien/ }).getAttribute('href')).toBe(
      '/mpz/studio/stationen/klassenzimmer?tab=medien',
    )
    expect(
      screen.getByRole('link', { name: /Hotspots/ }).getAttribute('href'),
    ).toBe('/mpz/studio/stationen/klassenzimmer?tab=hotspots')
  })

  it('Medien-Tab zeigt Tabelle für klassenzimmer', () => {
    mocks.searchParams = new URLSearchParams('tab=medien')
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} />,
    )

    expect(screen.getByRole('link', { name: 'Medien hinzufügen' })).toBeTruthy()
    expect(screen.getByText('demo-audio')).toBeTruthy()
    expect(screen.getByText('demo-video')).toBeTruthy()
  })

  it('Medien-Tab Empty-State für hort', () => {
    mocks.searchParams = new URLSearchParams('tab=medien')
    setReport('hort', false)
    const station = getStationBySlug('hort')!

    render(<StationDetailShell station={station} slug="hort" hubNr={9} />)

    expect(screen.getByText('Noch keine Medien')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Erstes Medium hinzufügen' })).toBeTruthy()
  })

  it('Breadcrumb verlinkt auf Stations-Grid', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} />,
    )

    expect(screen.getByRole('link', { name: '← Alle Stationen' }).getAttribute('href')).toBe(
      '/mpz/studio/stationen',
    )
  })

  it('station null zeigt slug als Titel-Fallback', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('kunst', false)
    mocks.report!.stationSummaries[0].titel = 'kunst'

    render(<StationDetailShell station={null} slug="kunst" hubNr={4} />)

    expect(screen.getByRole('heading', { level: 2, name: 'kunst' })).toBeTruthy()
  })
})
