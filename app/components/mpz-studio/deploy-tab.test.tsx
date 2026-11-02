/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeployTab } from '@/components/mpz-studio/deploy-tab'

const previewLinks = {
  hubUrl: 'https://39-gs.mpz.schule/',
  entryFestUrl: 'https://39-gs.mpz.schule/eintritt?t=fest',
  entryHeftUrl: 'https://39-gs.mpz.schule/eintritt?t=heft',
  rooms: [{ slug: 'kunst', url: 'https://39-gs.mpz.schule/raum/kunst' }],
}

function mockDeployTabFetch(
  handlers: {
    syncContent?: () => Response | Promise<Response>
  } = {},
) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.includes('/api/mpz/deploy/env')) {
        return {
          ok: true,
          json: async () => ({ baseUrl: 'https://39-gs.mpz.schule', embedEnabled: false }),
        }
      }
      if (url.includes('/api/mpz/deploy/preview-links')) {
        return {
          ok: true,
          json: async () => previewLinks,
        }
      }
      if (url.includes('/api/mpz/deploy/sync-content') && handlers.syncContent) {
        return handlers.syncContent()
      }
      return { ok: false, status: 404, json: async () => ({ message: 'unexpected' }) }
    }),
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('DeployTab', () => {
  it('zeigt Medien-deployen-Button mit Primär-Styling', async () => {
    mockDeployTabFetch()

    render(<DeployTab />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Medien deployen' })).toBeTruthy()
    })

    const button = screen.getByRole('button', { name: 'Medien deployen' })
    expect(button.className).toContain('bg-accent')
    expect(button.className).toContain('text-fg-on-dark')
  })

  it('zeigt Erfolgs-Alert nach Medien-Deploy', async () => {
    mockDeployTabFetch({
      syncContent: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          exitCode: 0,
          stdout: 'deploy-content: fertig.',
          stderr: '',
          mode: 'media-only',
        }),
      }),
    })

    render(<DeployTab />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Medien deployen' })).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Medien deployen' }))

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toContain(
        'Medien erfolgreich synchronisiert.',
      )
    })
  })

  it('zeigt Fehler-Alert bei VALIDATION 422', async () => {
    mockDeployTabFetch({
      syncContent: async () => ({
        ok: false,
        status: 422,
        json: async () => ({
          error: 'VALIDATION',
          message: 'DEPLOY_SSH ist nicht gesetzt.',
        }),
      }),
    })

    render(<DeployTab />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Medien deployen' })).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Medien deployen' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('DEPLOY_SSH ist nicht gesetzt.')
    })
  })

  it('zeigt Fehler-Alert und Skript-Details bei exitCode ungleich 0', async () => {
    mockDeployTabFetch({
      syncContent: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          ok: false,
          exitCode: 1,
          stdout: '',
          stderr: 'sudo auf Remote nicht NOPASSWD',
          mode: 'media-only',
        }),
      }),
    })

    render(<DeployTab />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Medien deployen' })).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Medien deployen' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Deploy-Skript mit Fehler beendet',
      )
    })

    expect(screen.getByText('Skript-Ausgabe')).toBeTruthy()
  })
})
