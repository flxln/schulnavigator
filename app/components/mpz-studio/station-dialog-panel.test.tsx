/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDialogPanel } from '@/components/mpz-studio/station-dialog-panel'
import { getStationBySlug } from '@/lib/stations'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  validateNow: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    validateNow: mocks.validateNow,
  }),
  markMpzStudioDirty: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  mocks.refresh.mockReset()
  mocks.validateNow.mockReset()
})

describe('StationDialogPanel', () => {
  it('zeigt Empty-State mit CTA ohne dialog-Block', () => {
    const station = getStationBySlug('klassenzimmer')!
    render(<StationDialogPanel slug="klassenzimmer" station={station} />)

    expect(screen.getByRole('button', { name: 'Dialog hinzufügen' })).toBeTruthy()
    expect(screen.getByText(/Maskottchen-Dialog mit Frieda und Otto/)).toBeTruthy()
  })

  it('ruft POST beim Anlegen auf', async () => {
    const station = getStationBySlug('klassenzimmer')!
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ station: { ...station, dialog: { figuren: ['frieda', 'otto'], segmente: [], gruppen: [] } } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<StationDialogPanel slug="klassenzimmer" station={station} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dialog hinzufügen' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mpz/stations/klassenzimmer/dialog',
        expect.objectContaining({ method: 'POST' }),
      )
    })
    expect(mocks.validateNow).toHaveBeenCalled()
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('zeigt Dialog entfernen bei bestehendem Dialog', () => {
    const station = getStationBySlug('daz')!
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: 'daz', segments: [], orphans: [], missingCount: 0, driftCount: 0 }),
      }),
    )

    render(<StationDialogPanel slug="daz" station={station} />)

    expect(screen.getByRole('button', { name: 'Dialog entfernen' })).toBeTruthy()
  })
})
