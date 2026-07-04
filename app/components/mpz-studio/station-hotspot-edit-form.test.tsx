/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationHotspotEditForm } from '@/components/mpz-studio/station-hotspot-edit-form'
import { studioDemoKlassenzimmerStation } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    validateNow: vi.fn().mockResolvedValue(undefined),
  }),
  markMpzStudioDirty: vi.fn(),
}))

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ paths: [] }),
  }),
)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('StationHotspotEditForm', () => {
  it('rendert mpzButton-Klassen für Speichern und Abbrechen', () => {
    const station = studioDemoKlassenzimmerStation
    const hotspot = station.hotspots360![0]

    render(
      <StationHotspotEditForm
        slug="klassenzimmer"
        station={station}
        hotspot={hotspot}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    const save = screen.getByRole('button', { name: 'Änderungen speichern' })
    const cancel = screen.getByRole('button', { name: 'Abbrechen' })

    expect(save.className).toContain('rounded-mpz-button-pill')
    expect(save.className).toContain('bg-accent')
    expect(cancel.className).toContain('rounded-mpz-button-pill')
    expect(cancel.className).toContain('border-border-1')
  })
})
