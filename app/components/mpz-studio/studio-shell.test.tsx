/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StudioShell } from '@/components/mpz-studio/studio-shell'

const NAV_COLLAPSED_KEY = 'mpz-studio:nav-collapsed'

const mocks = vi.hoisted(() => ({
  dirty: false,
  loading: true,
  error: null as string | null,
  saveFeedback: null,
  report: null as {
    stationSummaries: Array<{
      slug: string
      hubNr: number
      titel: string
      health: 'ok' | 'warn' | 'error'
    }>
  } | null,
  saveAndValidate: vi.fn(),
}))

let mqlChangeListener: ((e: MediaQueryListEvent) => void) | null = null
let mqlMatches = false
const storage = new Map<string, string>()

function installLocalStorage() {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => {
      storage.clear()
    },
  })
}

function installMatchMedia() {
  mqlChangeListener = null
  mqlMatches = false
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: mqlMatches,
    media: query,
    addEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') mqlChangeListener = cb
    },
    removeEventListener: (event: string) => {
      if (event === 'change') mqlChangeListener = null
    },
  }))
}

function dispatchMatchMediaChange(matches: boolean) {
  mqlMatches = matches
  mqlChangeListener?.({ matches, media: '(min-width: 1024px)' } as MediaQueryListEvent)
}

vi.mock('next/navigation', () => ({
  usePathname: () => '/mpz/studio',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/mpz-studio/plan-a-banner', () => ({
  PlanABanner: () => null,
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    report: mocks.report,
    loading: mocks.loading,
    dirty: mocks.dirty,
    error: mocks.error,
    saveFeedback: mocks.saveFeedback,
    applyReport: vi.fn(),
    markDirty: vi.fn(),
    validateNow: vi.fn(),
    saveAndValidate: mocks.saveAndValidate,
    clearSaveFeedback: vi.fn(),
  }),
}))

beforeEach(() => {
  installMatchMedia()
  installLocalStorage()
  mocks.loading = true
  mocks.dirty = false
  mocks.error = null
  mocks.saveFeedback = null
  mocks.report = null
  document.body.style.overflow = ''
})

afterEach(() => cleanup())

describe('StudioShell SaveControl', () => {
  it('deaktiviert Speichern während loading', () => {
    mocks.loading = true
    mocks.dirty = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const btn = screen.getByRole('button', { name: 'Prüft Struktur und Dateien…' })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('zeigt Dirty-Punkt mobil bei dirty und nicht loading', () => {
    mocks.loading = false
    mocks.dirty = true
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const dots = container.querySelectorAll('.bg-warn.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(1)
    const saveBtn = screen.getByRole('button', { name: 'Speichern & Validieren' })
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('zeigt Context-Fehler als Alert unter dem Header', () => {
    mocks.loading = false
    mocks.dirty = false
    mocks.error = 'Zuerst /mpz/unlock aufrufen.'
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    expect(screen.getByRole('alert').textContent).toContain('/mpz/unlock')
  })

  it('behält Pill-Radius bei deaktiviertem Save', () => {
    mocks.loading = false
    mocks.dirty = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const btn = screen.getByRole('button', { name: 'Speichern & Validieren' })
    expect(btn.className).toContain('rounded-mpz-button-pill')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('StudioShell Navigation', () => {
  it('setzt aria-expanded beim Menu-Klick', () => {
    mocks.loading = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const menu = screen.getByRole('button', { name: 'Navigation öffnen' })
    expect(menu.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(menu)
    expect(menu.getAttribute('aria-expanded')).toBe('true')
  })

  it('wendet lg:w-14 nach Collapse-Toggle an', () => {
    mocks.loading = false
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Navigation einklappen' }))
    const aside = container.querySelector('#studio-nav')
    expect(aside?.className).toContain('lg:w-14')
  })

  it('persistiert navCollapsed im Toggle-Handler', () => {
    mocks.loading = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Navigation einklappen' }))
    expect(storage.get(NAV_COLLAPSED_KEY)).toBe('true')
  })

  it('lädt navCollapsed beim Mount aus localStorage', () => {
    mocks.loading = false
    storage.set(NAV_COLLAPSED_KEY, 'true')
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const aside = container.querySelector('#studio-nav')
    expect(aside?.className).toContain('lg:w-14')
  })

  it('schließt Drawer bei Wechsel auf lg und hebt Body-Lock auf', () => {
    mocks.loading = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const menu = screen.getByRole('button', { name: 'Navigation öffnen' })
    fireEvent.click(menu)
    expect(menu.getAttribute('aria-expanded')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      dispatchMatchMediaChange(true)
    })

    expect(menu.getAttribute('aria-expanded')).toBe('false')
    expect(document.body.style.overflow).toBe('')
  })
})

describe('StudioShell #207 Shell-Chrome', () => {
  it('nutzt lg:w-mpz-sidebar im expanded Zustand', () => {
    mocks.loading = false
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const aside = container.querySelector('#studio-nav')
    expect(aside?.className).toContain('w-mpz-sidebar')
    expect(aside?.className).toContain('lg:w-mpz-sidebar')
    expect(aside?.className).not.toContain('lg:w-64')
    expect(aside?.className).not.toContain('w-72')
  })

  it('markiert aktiven Nav-Eintrag mit border-accent', () => {
    mocks.loading = false
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const dashboard = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboard.className).toContain('border-accent')
    expect(dashboard.className).not.toContain('border-white')
  })

  it('zeigt Nav-Icon im Drawer auch bei persistiertem collapsed', () => {
    mocks.loading = false
    storage.set(NAV_COLLAPSED_KEY, 'true')
    const { container } = render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Navigation öffnen' }))
    const dashboard = screen.getByRole('link', { name: 'Dashboard' })
    const icon = dashboard.querySelector('svg.size-5')
    expect(icon).not.toBeNull()
    expect(icon?.classList.contains('hidden')).toBe(false)
    expect(container.querySelector('#studio-nav')?.className).toContain('lg:w-14')
  })

  it('nutzt RoomRoster density room mit min-h-[40px]', () => {
    mocks.loading = false
    mocks.report = {
      stationSummaries: [
        { slug: 'musik', hubNr: 1, titel: 'Musikraum', health: 'ok' },
      ],
    }
    render(
      <StudioShell>
        <p>Inhalt</p>
      </StudioShell>,
    )
    const roomLink = screen.getByRole('link', { name: /Musikraum/ })
    expect(roomLink.className).toContain('min-h-[40px]')
    expect(roomLink.className).toContain('border-l-4')
    expect(roomLink.className).not.toContain('min-h-11')
  })
})
