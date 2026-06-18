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

  it('ohne Medien: Hinweis auf Ingest', () => {
    const station = { ...getStationBySlug('kunst')!, medien: [] }
    render(<StationHotspotAddForm slug="kunst" station={station} />)

    expect(screen.getByText('Hotspot hinzufügen')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Medium hinzufügen' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Hotspot anlegen' })).toBeNull()
  })

  it('mit Medien: zeigt Formularfelder für Sphere', async () => {
    const station = getStationBySlug('klassenzimmer')!
    render(<StationHotspotAddForm slug="klassenzimmer" station={station} />)

    expect(screen.getByLabelText('ID')).toBeTruthy()
    expect(screen.getByLabelText('yaw (°)')).toBeTruthy()
    expect(screen.getByLabelText('pitch (°)')).toBeTruthy()
    expect(screen.queryByLabelText('x')).toBeNull()
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
