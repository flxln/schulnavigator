/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDialogSegmentForm } from '@/components/mpz-studio/station-dialog-segment-form'
import { getStationBySlug } from '@/lib/stations'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  validateNow: vi.fn(),
  onSuccess: vi.fn(),
  onRefresh: vi.fn(),
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

function mockFilePick(file: File) {
  const origCreate = document.createElement.bind(document)
  const input = document.createElement('input')
  const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'input') {
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      queueMicrotask(() => {
        input.onchange?.(new Event('change') as unknown as Event)
      })
      return input
    }
    return origCreate(tag)
  })
  return createSpy
}

const dazAudit: DialogSegmentAudit = {
  segmentIndex: 0,
  segmentId: 'd1',
  rolle: 'frieda',
  textPreview: 'Hallo',
  expectedClip: '01-frieda.wav',
  quelle: '/api/dialog/daz/01-frieda.wav',
  fileExists: true,
  quelleMatchesConvention: true,
  state: 'ok',
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  mocks.refresh.mockReset()
  mocks.validateNow.mockReset()
  mocks.onSuccess.mockReset()
  mocks.onRefresh.mockReset()
})

describe('StationDialogSegmentForm', () => {
  it('zeigt Zielnamen-Vorschau bei aktivem Audio-Häkchen', () => {
    const station = getStationBySlug('daz')!

    render(
      <StationDialogSegmentForm
        slug="daz"
        mode="add"
        segment={null}
        segmentIndex={null}
        segmentCount={station.dialog!.segmente.length}
        audit={null}
        gruppen={[]}
        onCancel={() => {}}
        onSuccess={mocks.onSuccess}
        onRefresh={mocks.onRefresh}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('10-frieda.wav')).toBeTruthy()
    expect(screen.getByRole('button', { name: /WAV auswählen/ })).toBeTruthy()
  })

  it('chain-on-save: PATCH dann ingest bei edit', async () => {
    const station = getStationBySlug('daz')!
    const segment = station.dialog!.segmente[0]!
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          station: {
            ...station,
            dialog: {
              ...station.dialog!,
              segmente: station.dialog!.segmente,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'clip.wav', { type: 'audio/wav' })
    const createSpy = mockFilePick(file)

    render(
      <StationDialogSegmentForm
        slug="daz"
        mode="edit"
        segment={segment}
        segmentIndex={0}
        segmentCount={station.dialog!.segmente.length}
        audit={dazAudit}
        gruppen={[]}
        onCancel={() => {}}
        onSuccess={mocks.onSuccess}
        onRefresh={mocks.onRefresh}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /WAV ersetzen/ }))

    await waitFor(() => {
      expect(screen.getByText(/Ausgewählt: clip.wav/)).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/dialog/segmente/')
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/mpz/dialog-audio/ingest')
    expect(mocks.onSuccess).toHaveBeenCalledWith('Segment gespeichert und WAV hochgeladen.')
    createSpy.mockRestore()
  })

  it('chain-on-save: POST dann ingest bei add', async () => {
    const station = getStationBySlug('daz')!
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          station: {
            ...station,
            dialog: {
              ...station.dialog!,
              segmente: [
                ...station.dialog!.segmente,
                {
                  id: 'k3',
                  rolle: 'frieda',
                  text: 'Neu',
                  quelle: '/api/dialog/daz/03-frieda.wav',
                },
              ],
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'neu.wav', { type: 'audio/wav' })
    const createSpy = mockFilePick(file)

    render(
      <StationDialogSegmentForm
        slug="daz"
        mode="add"
        segmentCount={station.dialog!.segmente.length}
        segmentIndex={null}
        audit={null}
        gruppen={[]}
        onCancel={() => {}}
        onSuccess={mocks.onSuccess}
        onRefresh={mocks.onRefresh}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /WAV auswählen/ }))

    await waitFor(() => {
      expect(screen.getByText(/Ausgewählt: neu.wav/)).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/dialog/segmente')
    expect(mocks.onSuccess).toHaveBeenCalledWith('Segment angelegt und WAV hochgeladen.')
    createSpy.mockRestore()
  })

  it('Teilerfolg: Segment gespeichert, Upload fehlgeschlagen — Form bleibt, Retry sichtbar', async () => {
    const station = getStationBySlug('daz')!
    const segment = station.dialog!.segmente[0]!
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          station: {
            ...station,
            dialog: {
              ...station.dialog!,
              segmente: station.dialog!.segmente,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'Nur WAV-Dateien erlaubt (Magic-Byte-Prüfung). mp3/m4a werden abgelehnt.',
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['x'], 'bad.mp3', { type: 'audio/mpeg' })
    const createSpy = mockFilePick(file)

    render(
      <StationDialogSegmentForm
        slug="daz"
        mode="edit"
        segment={segment}
        segmentIndex={0}
        segmentCount={station.dialog!.segmente.length}
        audit={dazAudit}
        gruppen={[]}
        onCancel={() => {}}
        onSuccess={mocks.onSuccess}
        onRefresh={mocks.onRefresh}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /WAV ersetzen/ }))

    await waitFor(() => {
      expect(screen.getByText(/Ausgewählt: bad.mp3/)).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Speichern' }))

    await waitFor(() => {
      expect(screen.getByText(/Upload fehlgeschlagen/)).toBeTruthy()
    })
    expect(mocks.onSuccess).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Upload erneut versuchen' })).toBeTruthy()
    createSpy.mockRestore()
  })

  it('verwirft pendingFile wenn Audio-Häkchen aus', async () => {
    const station = getStationBySlug('daz')!

    const file = new File(['x'], 'clip.wav', { type: 'audio/wav' })
    const createSpy = mockFilePick(file)

    render(
      <StationDialogSegmentForm
        slug="daz"
        mode="add"
        segment={null}
        segmentIndex={null}
        segmentCount={station.dialog!.segmente.length}
        audit={null}
        gruppen={[]}
        onCancel={() => {}}
        onSuccess={mocks.onSuccess}
        onRefresh={mocks.onRefresh}
      />,
    )

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: /WAV auswählen/ }))

    await waitFor(() => {
      expect(screen.getByText(/Ausgewählt: clip.wav/)).toBeTruthy()
    })

    fireEvent.click(checkbox)
    expect(screen.queryByText(/Zielname:/)).toBeNull()
    createSpy.mockRestore()
  })
})
