/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MediaIngestModal } from '@/components/mpz-studio/media-ingest-modal'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    validateNow: vi.fn().mockResolvedValue(undefined),
    applyReport: vi.fn(),
  }),
  markMpzStudioDirty: vi.fn(),
}))

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function showModal(this: HTMLDialogElement) {
    this.open = true
  })
  HTMLDialogElement.prototype.close = vi.fn(function close(this: HTMLDialogElement) {
    this.open = false
  })
})

afterEach(() => {
  cleanup()
})

describe('MediaIngestModal', () => {
  it('zeigt Titel und Footer-Buttons', () => {
    render(
      <MediaIngestModal
        open
        slug="klassenzimmer"
        globalSuffixes={['bookcreator.com']}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Medium hinzufügen' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hinzufügen' })).toBeTruthy()
  })

  it('wechselt zwischen Datei-Drop-Zone und Link-Feldern', () => {
    render(
      <MediaIngestModal
        open
        slug="klassenzimmer"
        globalSuffixes={['bookcreator.com']}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText(/Datei hierher ziehen oder klicken/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'embed' }))
    expect(screen.queryByText(/Datei hierher ziehen oder klicken/)).toBeNull()
    expect(screen.getByLabelText(/Quelle \(https\)/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'foto' }))
    expect(screen.getByText(/Datei hierher ziehen oder klicken/)).toBeTruthy()
  })

  it('deaktiviert Hinzufügen ohne Datei bzw. bei invalider Embed-URL', () => {
    render(
      <MediaIngestModal
        open
        slug="klassenzimmer"
        globalSuffixes={['bookcreator.com']}
        onClose={vi.fn()}
      />,
    )

    const submit = screen.getByRole('button', { name: 'Hinzufügen' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'link' }))
    expect(submit.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Quelle \(https\)/), {
      target: { value: 'not-a-url' },
    })
    expect(submit.disabled).toBe(true)
  })
})
