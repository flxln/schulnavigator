/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDialogPanel } from '@/components/mpz-studio/station-dialog-panel'
import { getStationBySlug } from '@/lib/stations'
import type { DialogFigure } from '@/lib/types'

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
    expect(screen.getByText(/Noch kein Maskottchen-Dialog für diese Station/)).toBeTruthy()
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
        json: async () => ({
          slug: 'daz',
          segments: [
            {
              segmentIndex: 0,
              segmentId: station.dialog!.segmente[0]!.id,
              rolle: 'frieda',
              textPreview: 'x',
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

    render(<StationDialogPanel slug="daz" station={station} />)

    expect(screen.getByRole('button', { name: 'Dialog entfernen' })).toBeTruthy()
    expect(screen.queryByText(/folgt mit #200/)).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Audio' }).length).toBeGreaterThan(0)
  })

  it('zeigt leere Segment-Tabelle mit Hinweiszeile', () => {
    const station = getStationBySlug('klassenzimmer')!
    const withEmptyDialog = {
      ...station,
      dialog: { figuren: ['frieda', 'otto'] as DialogFigure[], segmente: [], gruppen: [] },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: 'klassenzimmer', segments: [], orphans: [], missingCount: 0, driftCount: 0 }),
      }),
    )

    render(<StationDialogPanel slug="klassenzimmer" station={withEmptyDialog} />)

    expect(screen.getByText('Noch keine Segmente')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Erstes Segment anlegen' })).toBeTruthy()
  })

  it('klappt Gruppen-Bereich auf ohne verschachtelte Buttons', () => {
    const station = getStationBySlug('daz')!
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ slug: 'daz', segments: [], orphans: [], missingCount: 0, driftCount: 0 }),
      }),
    )

    render(<StationDialogPanel slug="daz" station={station} />)

    const toggle = screen.getByRole('button', { name: /Gruppen/ })
    const addButton = screen.getByRole('button', { name: 'Gruppe hinzufügen' })
    expect(toggle).not.toBe(addButton)

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(/Hello! · Hola!/)).toBeTruthy()
  })
})
