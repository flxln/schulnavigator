/** @vitest-environment jsdom */
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationHotspotsTable } from '@/components/mpz-studio/station-hotspots-table'
import { getStationBySlug } from '@/lib/stations'

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
    const station = getStationBySlug('klassenzimmer')!
    render(<StationHotspotsTable slug="klassenzimmer" station={station} />)

    expect(screen.getByText('hs-text')).toBeTruthy()
    expect(screen.getByText('hs-video')).toBeTruthy()
    expect(screen.getByText('hs-audio')).toBeTruthy()
    expect(screen.getByText('hs-foto')).toBeTruthy()
    expect(screen.getByText('demo-text')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Kalibrieren (Hotspots + Startblick)' }).getAttribute('href'),
    ).toBe('/raum/klassenzimmer?hotspot-calib=1')
  })

  it('Empty-State für kunst ohne Hotspots', () => {
    const station = getStationBySlug('kunst')!
    render(<StationHotspotsTable slug="kunst" station={station} />)

    expect(screen.getByText('Keine Hotspots')).toBeTruthy()
    const calibLinks = screen.getAllByRole('link', { name: 'Hotspot kalibrieren' })
    expect(calibLinks.some((el) => el.getAttribute('href') === '/mpz/calib/flat/kunst')).toBe(
      true,
    )
  })

  it('station null zeigt Fehler', () => {
    render(<StationHotspotsTable slug="kunst" station={null} />)
    expect(screen.getByRole('alert').textContent).toContain('Station fehlt')
  })
})
