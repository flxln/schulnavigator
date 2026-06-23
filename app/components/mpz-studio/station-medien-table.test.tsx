/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationMedienTable } from '@/components/mpz-studio/station-medien-table'
import { mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { getStationBySlug } from '@/lib/stations'

const openMediaIngest = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/components/mpz-studio/media-ingest-modal-context', () => ({
  useMediaIngest: () => ({
    openMediaIngest,
  }),
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    validateNow: vi.fn().mockResolvedValue(undefined),
  }),
  markMpzStudioDirty: vi.fn(),
}))

vi.mock('@/components/mpz-studio/station-medium-edit-form', () => ({
  StationMediumEditForm: () => <div data-testid="medium-edit-form" />,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('StationMedienTable', () => {
  it('rendert Spalten ID vor Typ und Empty-State mit Tabellen-Header', () => {
    const station = { ...getStationBySlug('kunst')!, medien: [] }
    render(
      <StationMedienTable slug="kunst" station={station} globalSuffixes={['bookcreator.com']} />,
    )

    const table = screen.getByRole('table')
    const headers = within(table).getAllByRole('columnheader')
    expect(headers.map((h) => h.textContent?.trim())).toEqual([
      'ID',
      'Typ',
      'Untertitel',
      'Quelle',
      'Aktionen',
    ])
    expect(screen.getByText(/Noch keine Medien/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Erstes Medium hinzufügen' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Medien hinzufügen' })).toHaveLength(1)
  })

  it('nutzt mpzButton primary am CTA', () => {
    const station = { ...getStationBySlug('kunst')!, medien: [] }
    render(
      <StationMedienTable slug="kunst" station={station} globalSuffixes={['bookcreator.com']} />,
    )

    const cta = screen.getByRole('button', { name: 'Medien hinzufügen' })
    expect(cta.className).toContain(mpzButtonClassName('primary').split(' ')[0])
    fireEvent.click(cta)
    expect(openMediaIngest).toHaveBeenCalledWith({ slug: 'kunst' })
  })

  it('zeigt Medienzeilen bei gefüllter Liste', () => {
    const station = getStationBySlug('klassenzimmer')!
    render(
      <StationMedienTable
        slug="klassenzimmer"
        station={station}
        globalSuffixes={['bookcreator.com']}
      />,
    )

    expect(screen.getByText('demo-audio')).toBeTruthy()
    expect(screen.getByText('demo-video')).toBeTruthy()
  })

  it('markiert aktive Zeile beim Bearbeiten', () => {
    const station = getStationBySlug('klassenzimmer')!
    render(
      <StationMedienTable
        slug="klassenzimmer"
        station={station}
        globalSuffixes={['bookcreator.com']}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Bearbeiten' })[1]!)
    expect(screen.getByText('Wird bearbeitet')).toBeTruthy()
    expect(screen.getByTestId('medium-edit-form')).toBeTruthy()

    const row = screen.getByText('demo-video').closest('tr')
    expect(row?.querySelector('td')?.className).toContain('border-l-accent')
  })

  it('station null zeigt MpzFormAlert', () => {
    render(
      <StationMedienTable slug="kunst" station={null} globalSuffixes={['bookcreator.com']} />,
    )
    expect(screen.getByRole('alert').textContent).toContain('Station fehlt')
  })
})
