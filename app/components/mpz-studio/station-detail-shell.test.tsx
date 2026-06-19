/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDetailShell } from '@/components/mpz-studio/station-detail-shell'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'
import { getStationBySlug } from '@/lib/stations'

const GLOBAL_SUFFIXES = ['bookcreator.com', 'delightex.com'] as const

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

vi.mock('@/components/mpz-studio/media-ingest-modal-context', () => ({
  useMediaIngest: () => ({
    openMediaIngest: vi.fn(),
  }),
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
  vi.unstubAllGlobals()
})

describe('StationDetailShell', () => {
  it('rendert drei Tabs ohne Dialog für klassenzimmer', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} globalSuffixes={GLOBAL_SUFFIXES} />,
    )

    expect(screen.getByRole('link', { name: 'Stammdaten' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Medien/ })).toBeTruthy()
    const nav = screen.getByRole('navigation', { name: 'Station bearbeiten' })
    expect(within(nav).getByRole('link', { name: /Hotspots/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Dialog' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Dialog-Audio' })).toBeNull()
  })

  it('rendert Dialog- und Dialog-Audio-Tabs für daz wenn hasDialog', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('daz', true)
    const station = getStationBySlug('daz')!

    render(<StationDetailShell station={station} slug="daz" hubNr={3} globalSuffixes={GLOBAL_SUFFIXES} />)

    expect(screen.getByRole('link', { name: 'Dialog' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Dialog-Audio' })).toBeTruthy()
  })

  it('Dialog-Audio-Tab zeigt Segment-Tabelle für daz', async () => {
    mocks.searchParams = new URLSearchParams('tab=dialog-audio')
    setReport('daz', true)
    const station = getStationBySlug('daz')!

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          slug: 'daz',
          segments: [
            {
              segmentIndex: 0,
              segmentId: 'd1',
              rolle: 'frieda',
              textPreview: 'Hallo, willkommen',
              expectedClip: '01-frieda.wav',
              quelle: '/api/dialog/daz/01-frieda.wav',
              fileExists: true,
              quelleMatchesConvention: true,
              state: 'ok',
            },
          ],
          orphans: [],
          missingCount: 0,
          driftCount: 0,
        }),
      }),
    )

    render(<StationDetailShell station={station} slug="daz" hubNr={3} globalSuffixes={GLOBAL_SUFFIXES} />)

    expect(screen.queryByText('Dialog-Audio-Tab folgt in #163.')).toBeNull()
    expect(await screen.findByText('Clip')).toBeTruthy()
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('01-frieda.wav')).toBeTruthy()
  })

  it('Tab-Links enthalten korrektes ?tab=', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} globalSuffixes={GLOBAL_SUFFIXES} />,
    )

    expect(screen.getByRole('link', { name: /Medien/ }).getAttribute('href')).toBe(
      '/mpz/studio/stationen/klassenzimmer?tab=medien',
    )
    const nav = screen.getByRole('navigation', { name: 'Station bearbeiten' })
    expect(
      within(nav).getByRole('link', { name: /Hotspots/ }).getAttribute('href'),
    ).toBe('/mpz/studio/stationen/klassenzimmer?tab=hotspots')
  })

  it('Medien-Tab zeigt Tabelle für klassenzimmer', () => {
    mocks.searchParams = new URLSearchParams('tab=medien')
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} globalSuffixes={GLOBAL_SUFFIXES} />,
    )

    expect(screen.getByRole('button', { name: 'Medien hinzufügen' })).toBeTruthy()
    expect(screen.getByText('demo-audio')).toBeTruthy()
    expect(screen.getByText('demo-video')).toBeTruthy()
  })

  it('Medien-Tab Empty-State für hort', () => {
    mocks.searchParams = new URLSearchParams('tab=medien')
    const emptyHort = {
      slug: 'hort',
      titel: 'Hortzimmer',
      beschreibung: 'Test',
      bild: '/stations/hort.jpg',
      medien: [],
    }
    mocks.report = {
      ok: true,
      checkedAt: new Date().toISOString(),
      durationMs: 1,
      errors: [],
      warnings: [],
      bySlug: {},
      stationsModifiedAt: null,
      stationSummaries: [
        {
          slug: 'hort',
          hubNr: 9,
          titel: 'Hortzimmer',
          viewer: 'flat',
          medienCount: 0,
          hotspotCount: 0,
          hasDialog: false,
          hasBild: true,
          health: 'ok',
          issues: [],
        },
      ],
    }

    render(<StationDetailShell station={emptyHort} slug="hort" hubNr={9} globalSuffixes={GLOBAL_SUFFIXES} />)

    expect(screen.getByText('Noch keine Medien')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Erstes Medium hinzufügen' })).toBeTruthy()
  })

  it('Breadcrumb verlinkt auf Stations-Grid', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} globalSuffixes={GLOBAL_SUFFIXES} />,
    )

    expect(screen.getByRole('link', { name: '← Alle Stationen' }).getAttribute('href')).toBe(
      '/mpz/studio/stationen',
    )
  })

  it('Hotspots-Tab zeigt Tabelle für klassenzimmer', () => {
    mocks.searchParams = new URLSearchParams('tab=hotspots')
    setReport('klassenzimmer', false)
    const station = getStationBySlug('klassenzimmer')!

    render(
      <StationDetailShell station={station} slug="klassenzimmer" hubNr={1} globalSuffixes={GLOBAL_SUFFIXES} />,
    )

    expect(screen.getByText('hs-text')).toBeTruthy()
    expect(screen.getByText('hs-foto')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Kalibrieren (Hotspots + Startblick)' }).getAttribute('href'),
    ).toBe('/raum/klassenzimmer?hotspot-calib=1')
  })

  it('Hotspots-Tab Empty-State für kunst', () => {
    mocks.searchParams = new URLSearchParams('tab=hotspots')
    setReport('kunst', false)
    const station = {
      ...getStationBySlug('kunst')!,
      hotspots: undefined,
      hotspots360: undefined,
    }

    render(<StationDetailShell station={station} slug="kunst" hubNr={4} globalSuffixes={GLOBAL_SUFFIXES} />)

    expect(screen.getByText('Keine Hotspots')).toBeTruthy()
  })

  it('station null zeigt slug als Titel-Fallback', () => {
    mocks.searchParams = new URLSearchParams()
    setReport('kunst', false)
    mocks.report!.stationSummaries[0].titel = 'kunst'

    render(<StationDetailShell station={null} slug="kunst" hubNr={4} globalSuffixes={GLOBAL_SUFFIXES} />)

    expect(screen.getByRole('heading', { level: 2, name: 'kunst' })).toBeTruthy()
  })
})
