/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationHotspotsTable } from '@/components/mpz-studio/station-hotspots-table'
import { getStationBySlug } from '@/lib/stations'
import { studioDemoKlassenzimmerStation } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

vi.mock('next/navigation', () => ({
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
    validateNow: vi.fn().mockResolvedValue(undefined),
  }),
  markMpzStudioDirty: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('StationHotspotsTable', () => {
  it('zeigt Sphere-Hotspots für klassenzimmer', () => {
    const station = studioDemoKlassenzimmerStation
    render(<StationHotspotsTable slug="klassenzimmer" station={station} />)

    expect(screen.getByText('hs-text')).toBeTruthy()
    expect(screen.getByText('hs-video')).toBeTruthy()
    expect(screen.getByText('hs-audio')).toBeTruthy()
    expect(screen.getByText('hs-foto')).toBeTruthy()
    expect(screen.getByText('demo-text')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Sphere kalibrieren' }).getAttribute('href'),
    ).toBe('/mpz/calib/sphere/klassenzimmer')
  })

  it('Empty-State für kunst ohne Hotspots', () => {
    const station = { ...getStationBySlug('kunst')!, hotspots: undefined, hotspots360: undefined }
    render(<StationHotspotsTable slug="kunst" station={station} />)

    expect(screen.getByText(/Noch keine Hotspots/)).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeTruthy()
    const calibLinks = screen.getAllByRole('link', { name: 'Hotspot kalibrieren' })
    expect(calibLinks.some((el) => el.getAttribute('href') === '/mpz/calib/flat/kunst')).toBe(
      true,
    )
  })

  it('station null zeigt Fehler', () => {
    render(<StationHotspotsTable slug="kunst" station={null} />)
    expect(screen.getByRole('alert').textContent).toContain('Station fehlt')
  })

  it('zeigt Add-Formular bei Station mit Medien', () => {
    const station = studioDemoKlassenzimmerStation
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ paths: [] }),
      }),
    )

    render(<StationHotspotsTable slug="klassenzimmer" station={station} />)

    expect(screen.getByRole('button', { name: 'Hotspot anlegen' })).toBeTruthy()
    expect(screen.getByLabelText('yaw (°)')).toBeTruthy()

    vi.unstubAllGlobals()
  })

  it('ohne Medien: Ingest-Hinweis statt Anlege-Button', () => {
    const station = {
      ...getStationBySlug('kunst')!,
      medien: [],
      hotspots: undefined,
      hotspots360: undefined,
      dialog: undefined,
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ paths: [] }),
      }),
    )

    render(<StationHotspotsTable slug="kunst" station={station} />)

    expect(screen.getByRole('link', { name: 'Medium hinzufügen' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Medium hinzufügen' }).getAttribute('href'),
    ).toBe('/mpz/studio/stationen/kunst?tab=medien')
    expect(screen.queryByRole('button', { name: 'Hotspot anlegen' })).toBeNull()

    vi.unstubAllGlobals()
  })
})
