/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canReplaceMediumFile,
  StationMediumEditForm,
} from '@/components/mpz-studio/station-medium-edit-form'
import { UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import { getStationBySlug } from '@/lib/stations'
import type { Medium } from '@/lib/types'

const validateNow = vi.fn().mockResolvedValue(undefined)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({ validateNow }),
  markMpzStudioDirty: vi.fn(),
}))

const globalSuffixes: string[] = []

function renderForm(medium: Medium, onSuccess = vi.fn()) {
  return {
    onSuccess,
    ...render(
      <StationMediumEditForm
        slug="klassenzimmer"
        medium={medium}
        globalSuffixes={globalSuffixes}
        onCancel={vi.fn()}
        onSuccess={onSuccess}
      />,
    ),
  }
}

describe('canReplaceMediumFile', () => {
  it('audio → true', () => {
    expect(
      canReplaceMediumFile(
        { id: 'a', typ: 'audio', quelle: '/media/x.mp3' },
        'upload',
      ),
    ).toBe(true)
  })

  it('link → false', () => {
    expect(
      canReplaceMediumFile(
        { id: 'l', typ: 'link', quelle: 'https://example.com' },
        'upload',
      ),
    ).toBe(false)
  })

  it('video youtube persistiert → false', () => {
    expect(
      canReplaceMediumFile(
        {
          id: 'v',
          typ: 'video',
          quelle: 'https://youtube.com/watch?v=x',
          videoSource: 'youtube',
        },
        'upload',
      ),
    ).toBe(false)
  })
})

describe('StationMediumEditForm — Datei ersetzen', () => {
  beforeEach(() => {
    validateNow.mockClear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          quelle: '/media/klassenzimmer/audio/neu.mp3',
          fileReplaced: true,
        }),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('Audio-Medium: Replace-Abschnitt und Button sichtbar', () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    expect(screen.getByLabelText('Neue Datei')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Datei ersetzen' })).toBeTruthy()
  })

  it('Video videoSource upload: Replace sichtbar', () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-video')!
    renderForm(medium)

    expect(screen.getByRole('button', { name: 'Datei ersetzen' })).toBeTruthy()
  })

  it('Video videoSource youtube (persistiert): kein Replace-Block', () => {
    renderForm({
      id: 'yt-video',
      typ: 'video',
      quelle: 'https://www.youtube.com/watch?v=abc',
      videoSource: 'youtube',
    })

    expect(screen.queryByRole('button', { name: 'Datei ersetzen' })).toBeNull()
  })

  it('Video upload: Dropdown auf youtube blendet Block aus', () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-video')!
    renderForm(medium)

    fireEvent.change(screen.getByLabelText('videoSource'), { target: { value: 'youtube' } })
    expect(screen.queryByRole('button', { name: 'Datei ersetzen' })).toBeNull()
  })

  it('Video youtube persistiert, Dropdown upload: Hinweis, kein Replace', () => {
    renderForm({
      id: 'yt-video',
      typ: 'video',
      quelle: 'https://www.youtube.com/watch?v=abc',
      videoSource: 'youtube',
    })

    fireEvent.change(screen.getByLabelText('videoSource'), { target: { value: 'upload' } })
    expect(screen.queryByRole('button', { name: 'Datei ersetzen' })).toBeNull()
    expect(screen.getByText('Erst speichern, dann kann die Datei ersetzt werden.')).toBeTruthy()
  })

  it('link-Medium: kein Replace-Block', () => {
    renderForm({
      id: 'ext-link',
      typ: 'link',
      quelle: 'https://example.com',
    })

    expect(screen.queryByText('Datei ersetzen')).toBeNull()
  })

  it('Datei zu groß: lokaler Fehler, kein fetch', async () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    const file = new File(['x'], 'big.mp3', { type: 'audio/mpeg' })
    Object.defineProperty(file, 'size', {
      value: UPLOAD_RULES.audio.maxBytes + 1,
    })

    fireEvent.change(screen.getByLabelText('Neue Datei'), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Datei ersetzen' }))

    expect((await screen.findByRole('alert')).textContent).toContain('Datei zu groß')
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('Sichtbarkeit wechselt: selectedFile wird zurückgesetzt', async () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-video')!
    renderForm(medium)

    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' })
    fireEvent.change(screen.getByLabelText('Neue Datei'), {
      target: { files: [file] },
    })

    fireEvent.change(screen.getByLabelText('videoSource'), { target: { value: 'youtube' } })
    fireEvent.change(screen.getByLabelText('videoSource'), { target: { value: 'upload' } })

    fireEvent.click(screen.getByRole('button', { name: 'Datei ersetzen' }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Bitte zuerst eine Datei wählen.',
    )
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('erfolgreicher Replace: POST, onSuccess mit quelle', async () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    const onSuccess = vi.fn()
    renderForm(medium, onSuccess)

    const file = new File(['audio'], 'neu.mp3', { type: 'audio/mpeg' })
    fireEvent.change(screen.getByLabelText('Neue Datei'), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Datei ersetzen' }))

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/mpz/stations/klassenzimmer/medien/demo-audio/file',
        expect.objectContaining({ method: 'POST' }),
      )
    })
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.stringContaining('/media/klassenzimmer/audio/neu.mp3'),
      )
    })
    expect(validateNow).toHaveBeenCalled()
  })

  it('API-Fehler 422: message im Alert', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        error: 'VALIDATION',
        message: 'Dateiformat nicht erkennbar.',
      }),
    } as Response)

    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    fireEvent.change(screen.getByLabelText('Neue Datei'), {
      target: { files: [new File(['x'], 'bad.mp3')] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Datei ersetzen' }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Dateiformat nicht erkennbar.',
    )
  })

  it('Guard 401 ohne message: error-Fallback', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'UNAUTHORIZED' }),
    } as Response)

    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    fireEvent.change(screen.getByLabelText('Neue Datei'), {
      target: { files: [new File(['x'], 'ok.mp3')] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Datei ersetzen' }))

    expect((await screen.findByRole('alert')).textContent).toContain('UNAUTHORIZED')
  })
})

describe('StationMediumEditForm — Thumbnail/Poster-Upload', () => {
  beforeEach(() => {
    validateNow.mockClear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          path: '/media/klassenzimmer/fotos/thumb.jpg',
          field: 'thumbnail',
        }),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('Audio: Bild-hochladen-Button sichtbar', () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    expect(screen.getAllByRole('button', { name: 'Bild hochladen' }).length).toBeGreaterThan(0)
  })

  it('bei isDirty: Upload-Button deaktiviert', () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    renderForm(medium)

    fireEvent.change(screen.getByLabelText('Untertitel (optional)'), {
      target: { value: 'Neuer Untertitel' },
    })

    const uploadButtons = screen.getAllByRole('button', { name: 'Bild hochladen' })
    for (const btn of uploadButtons) {
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    }
    expect(
      screen.getAllByText(
        'Bitte zuerst Änderungen speichern, bevor ein Bild hochgeladen wird.',
      ).length,
    ).toBeGreaterThan(0)
  })

  it('erfolgreicher Thumbnail-Upload: POST auf …/thumbnail', async () => {
    const station = getStationBySlug('klassenzimmer')!
    const medium = station.medien.find((m) => m.id === 'demo-audio')!
    const onSuccess = vi.fn()
    renderForm(medium, onSuccess)

    const fileInput = document.getElementById('edit-med-demo-audio-thumbnail-file')!
    fireEvent.change(fileInput, {
      target: { files: [new File(['img'], 'thumb.jpg', { type: 'image/jpeg' })] },
    })

    await waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        '/api/mpz/stations/klassenzimmer/medien/demo-audio/thumbnail',
        expect.objectContaining({ method: 'POST' }),
      )
    })
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(expect.stringContaining('thumb.jpg'))
    })
  })
})
