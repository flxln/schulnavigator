/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StationRaumbildUpload } from '@/components/mpz-studio/station-raumbild-upload'
import { getStationBySlug } from '@/lib/stations'
import { studioDemoKlassenzimmerStation } from '@/lib/test-fixtures/studio-demo-klassenzimmer'

const mocks = vi.hoisted(() => ({
  validateNow: vi.fn(),
  refresh: vi.fn(),
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
  vi.restoreAllMocks()
})

beforeEach(() => {
  mocks.validateNow.mockReset()
  mocks.refresh.mockReset()
})

describe('StationRaumbildUpload', () => {
  it('blendet 360°-Zone bei viewer=flat aus und nutzt kein 2-Spalten-Grid', () => {
    const station = getStationBySlug('kunst')
    expect(station).toBeTruthy()

    render(
      <StationRaumbildUpload slug="kunst" station={station!} viewer="flat" />,
    )

    expect(screen.getByText('Flat-Panorama')).toBeTruthy()
    expect(screen.queryByText('Panorama 360°')).toBeNull()

    const zones = screen.getByTestId('raumbild-zones')
    expect(zones.className).not.toContain('sm:grid-cols-2')
    expect(zones.className).toContain('flex flex-col')
  })

  it('zeigt beide Zonen bei viewer=equirectangular im 2-Spalten-Grid', () => {
    const station = studioDemoKlassenzimmerStation
    expect(station).toBeTruthy()

    render(
      <StationRaumbildUpload
        slug="klassenzimmer"
        station={station!}
        viewer="equirectangular"
      />,
    )

    expect(screen.getByText('Flat-Panorama')).toBeTruthy()
    expect(screen.getByText('Panorama 360°')).toBeTruthy()

    const zones = screen.getByTestId('raumbild-zones')
    expect(zones.className).toContain('sm:grid-cols-2')
  })

  it('zeigt MpzFormAlert bei Upload-Fehler', async () => {
    const station = getStationBySlug('kunst')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Datei zu groß.' }),
      }),
    )

    render(
      <StationRaumbildUpload slug="kunst" station={station!} viewer="flat" />,
    )

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Datei zu groß.')
    })
  })
})
