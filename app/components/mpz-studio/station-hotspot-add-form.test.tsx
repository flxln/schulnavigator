/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StationHotspotAddForm } from '@/components/mpz-studio/station-hotspot-add-form'
import { getStationBySlug } from '@/lib/stations'
import type { Station } from '@/lib/types'

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

describe('StationHotspotAddForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ paths: [] }),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('ohne Medien und ohne Dialog: Hinweis mit Links', () => {
    const station = { ...getStationBySlug('kunst')!, medien: [], dialog: undefined }
    render(<StationHotspotAddForm slug="kunst" station={station} />)

    expect(screen.getByText('Hotspot hinzufügen')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Medium hinzufügen' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Medium hinzufügen' }).getAttribute('href'),
    ).toBe('/mpz/studio/stationen/kunst?tab=medien')
    expect(screen.getByRole('link', { name: 'Dialog-Tab öffnen' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Hotspot anlegen' })).toBeNull()
  })

  it('mit Dialog ohne Medien: zeigt Dialog-Formular', () => {
    const station = {
      ...getStationBySlug('daz')!,
      medien: [],
    }
    render(<StationHotspotAddForm slug="daz" station={station} />)

    expect(screen.getByRole('button', { name: 'Dialog-Hotspot (Maskottchen)' })).toBeTruthy()
    expect(screen.getByLabelText('Maskottchen')).toBeTruthy()
    expect(screen.queryByLabelText('Medium')).toBeNull()
    expect(screen.getByRole('link', { name: 'Zuerst Medium anlegen' })).toBeTruthy()
  })

  it('mit Medien und Dialog: Typ-Umschaltung per Karten', () => {
    const station = getStationBySlug('pc-raum')!
    render(<StationHotspotAddForm slug="pc-raum" station={station} />)

    expect(screen.getByLabelText('Medium')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Dialog-Hotspot (Maskottchen)' }))
    expect(screen.getByLabelText('Maskottchen')).toBeTruthy()
    expect(screen.queryByLabelText('Medium')).toBeNull()
  })

  it('Typwechsel behält id und Koordinaten', () => {
    const station = getStationBySlug('pc-raum')!
    render(<StationHotspotAddForm slug="pc-raum" station={station} />)

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'hs-test' } })
    fireEvent.change(screen.getByLabelText('yaw (°)'), { target: { value: '42' } })
    fireEvent.change(screen.getByLabelText('pitch (°)'), { target: { value: '-12' } })

    fireEvent.click(screen.getByRole('button', { name: 'Dialog-Hotspot (Maskottchen)' }))
    expect((screen.getByLabelText('ID') as HTMLInputElement).value).toBe('hs-test')
    expect((screen.getByLabelText('yaw (°)') as HTMLInputElement).value).toBe('42')
    expect((screen.getByLabelText('pitch (°)') as HTMLInputElement).value).toBe('-12')

    fireEvent.click(screen.getByRole('button', { name: 'Medien-Hotspot' }))
    expect((screen.getByLabelText('ID') as HTMLInputElement).value).toBe('hs-test')
    expect((screen.getByLabelText('yaw (°)') as HTMLInputElement).value).toBe('42')
    expect((screen.getByLabelText('pitch (°)') as HTMLInputElement).value).toBe('-12')
  })

  it('nur Medien: Dialog-Karte disabled mit CTA, kein POST beim Klick', () => {
    const station = getStationBySlug('klassenzimmer')!
    render(<StationHotspotAddForm slug="klassenzimmer" station={station} />)

    expect(screen.getByRole('button', { name: 'Medien-Hotspot' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Zuerst Dialog-Figur anlegen' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Dialog-Hotspot (Maskottchen)' })).toBeNull()

    const postCallsBefore = vi.mocked(fetch).mock.calls.filter(
      ([url, init]) =>
        typeof url === 'string' &&
        url.includes('/hotspots') &&
        (init as RequestInit | undefined)?.method === 'POST',
    ).length

    fireEvent.click(screen.getByRole('link', { name: 'Zuerst Dialog-Figur anlegen' }))

    const postCallsAfter = vi.mocked(fetch).mock.calls.filter(
      ([url, init]) =>
        typeof url === 'string' &&
        url.includes('/hotspots') &&
        (init as RequestInit | undefined)?.method === 'POST',
    ).length

    expect(postCallsAfter).toBe(postCallsBefore)
  })

  it('mit Medien: zeigt Formularfelder für Sphere', async () => {
    const station = getStationBySlug('klassenzimmer')!
    render(<StationHotspotAddForm slug="klassenzimmer" station={station} />)

    expect(screen.getByLabelText('ID')).toBeTruthy()
    expect(screen.getByLabelText('yaw (°)')).toBeTruthy()
    expect(screen.getByLabelText('pitch (°)')).toBeTruthy()
    expect(screen.queryByLabelText('x')).toBeNull()

    const calibLink = screen.getByRole('link', { name: 'Kalibrieren' })
    expect(calibLink.getAttribute('href')).toBe('/mpz/calib/sphere/klassenzimmer')
    expect(calibLink.getAttribute('target')).toBeNull()

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/mpz/stations/klassenzimmer/hotspot-icons',
      )
    })
  })

  it('Flat-Station: zeigt x/y statt yaw/pitch', () => {
    const station = {
      ...getStationBySlug('kunst')!,
      medien: [{ id: 'm1', typ: 'text', quelle: '/media/kunst/texte/a.md' }],
      viewer: 'flat' as const,
    } satisfies Station

    render(<StationHotspotAddForm slug="kunst" station={station} />)

    expect(screen.getByLabelText('x')).toBeTruthy()
    expect(screen.getByLabelText('y')).toBeTruthy()
    expect(screen.queryByLabelText('yaw (°)')).toBeNull()
  })

  it('erfolgreicher Submit zeigt Erfolgsmeldung', async () => {
    const station = getStationBySlug('klassenzimmer')!
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ paths: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ station, mtime: null }),
      } as Response)

    render(<StationHotspotAddForm slug="klassenzimmer" station={station} />)

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'hs-neu' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hotspot anlegen' }))

    await waitFor(() => {
      expect(screen.getByText(/Hotspot „hs-neu" angelegt/)).toBeTruthy()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/mpz/stations/klassenzimmer/hotspots',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"id":"hs-neu"'),
      }),
    )
  })

  it('Fehler vom Server werden angezeigt', async () => {
    const station = getStationBySlug('klassenzimmer')!
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ paths: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'ID existiert bereits' }),
      } as Response)

    render(<StationHotspotAddForm slug="klassenzimmer" station={station} />)

    fireEvent.change(screen.getByLabelText('ID'), { target: { value: 'hs-text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hotspot anlegen' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('ID existiert bereits')
    })
  })
})
