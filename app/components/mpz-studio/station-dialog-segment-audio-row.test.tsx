/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationDialogSegmentAudioRow } from '@/components/mpz-studio/station-dialog-segment-audio-row'
import type { DialogSegmentAudit } from '@/lib/mpz-dialog-audio-ingest'

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

const baseAudit: DialogSegmentAudit = {
  segmentIndex: 0,
  segmentId: 'seg-01',
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
  vi.spyOn(window, 'confirm').mockRestore()
})

describe('StationDialogSegmentAudioRow', () => {
  it('zeigt Audio-Player mit Inline-playUrl bei fileExists', () => {
    render(
      <StationDialogSegmentAudioRow
        slug="daz"
        audit={baseAudit}
        onMutated={async () => {}}
      />,
    )

    const audio = document.querySelector('audio')
    expect(audio).toBeTruthy()
    expect(audio?.getAttribute('src')).toBe('/api/dialog/daz/01-frieda.wav')
  })

  it('zeigt keinen Player ohne Datei', () => {
    render(
      <StationDialogSegmentAudioRow
        slug="daz"
        audit={{ ...baseAudit, fileExists: false, state: 'leer' }}
        onMutated={async () => {}}
      />,
    )

    expect(document.querySelector('audio')).toBeNull()
    expect(screen.getByRole('button', { name: 'WAV hochladen' })).toBeTruthy()
  })

  it('ruft ingest POST beim Upload auf', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)
    const onMutated = vi.fn().mockResolvedValue(undefined)

    const origCreate = document.createElement.bind(document)
    const input = document.createElement('input')
    const file = new File(['x'], 'clip.wav', { type: 'audio/wav' })
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

    render(
      <StationDialogSegmentAudioRow
        slug="daz"
        audit={baseAudit}
        onMutated={onMutated}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'WAV ersetzen' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mpz/dialog-audio/ingest',
        expect.objectContaining({ method: 'POST' }),
      )
    })
    expect(mocks.validateNow).toHaveBeenCalled()
    expect(onMutated).toHaveBeenCalled()
    createSpy.mockRestore()
  })

  it('zeigt Hinweis bei audio onError', () => {
    render(
      <StationDialogSegmentAudioRow
        slug="daz"
        audit={baseAudit}
        onMutated={async () => {}}
      />,
    )

    const audio = document.querySelector('audio')
    expect(audio).toBeTruthy()
    fireEvent.error(audio!)
    expect(screen.getByText(/Zugangstoken fehlt/)).toBeTruthy()
  })

  it('ruft DELETE clip nach Bestätigung auf', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fileDeleted: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const onMutated = vi.fn().mockResolvedValue(undefined)

    render(
      <StationDialogSegmentAudioRow
        slug="daz"
        audit={baseAudit}
        onMutated={onMutated}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clip entfernen' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/mpz/dialog-audio/clip?slug=daz&segmentIndex=0',
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
    expect(mocks.validateNow).toHaveBeenCalled()
  })
})
