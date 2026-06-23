/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StationStammdatenForm } from '@/components/mpz-studio/station-stammdaten-form'
import { mpzFieldClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { getStationBySlug } from '@/lib/stations'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
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

vi.mock('@/components/mpz-studio/station-raumbild-upload', () => ({
  StationRaumbildUpload: () => <div data-testid="raumbild-upload-mock" />,
}))

vi.mock('@/components/mpz-studio/studio-validation-context', () => ({
  useStudioValidation: () => ({
    validateNow: vi.fn(),
  }),
  markMpzStudioDirty: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('StationStammdatenForm', () => {
  it('nutzt mpz-form-primitives auf Eingabefeldern', () => {
    const station = getStationBySlug('kunst')
    expect(station).toBeTruthy()

    render(<StationStammdatenForm slug="kunst" station={station} />)

    const fieldClass = mpzFieldClassName()
    expect(screen.getByLabelText('Slug').className).toContain('read-only:bg-bg-2')
    expect(screen.getByLabelText('Slug').className).toContain(fieldClass.split(' ')[0])
    expect(screen.getByLabelText('Titel').className).toContain(fieldClass.split(' ')[0])
    expect(screen.getByLabelText('Beschreibung').className).toContain('min-h-24')
    expect(screen.getByLabelText('Viewer').className).toContain(fieldClass.split(' ')[0])
  })

  it('Slug-Input ist readOnly', () => {
    const station = getStationBySlug('kunst')
    render(<StationStammdatenForm slug="kunst" station={station} />)

    const slugInput = screen.getByLabelText('Slug') as HTMLInputElement
    expect(slugInput.readOnly).toBe(true)
    expect(slugInput.value).toBe('kunst')
  })

  it('zeigt text-error bei leerem Titel nach Submit', () => {
    const station = getStationBySlug('kunst')
    render(<StationStammdatenForm slug="kunst" station={station} />)

    fireEvent.change(screen.getByLabelText('Titel'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Übernehmen' }))

    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('text-error')
    expect(alert.textContent).toContain('Titel darf nicht leer sein')
  })

  it('deaktiviert Viewer-Select bei Hotspots', () => {
    const station = getStationBySlug('klassenzimmer')
    expect(station?.hotspots360?.length).toBeGreaterThan(0)

    render(<StationStammdatenForm slug="klassenzimmer" station={station} />)

    const viewerSelect = screen.getByLabelText('Viewer') as HTMLSelectElement
    expect(viewerSelect.disabled).toBe(true)
  })

  it('zeigt Fehler bei fehlender Station', () => {
    render(<StationStammdatenForm slug="fehlt" station={null} />)

    expect(screen.getByRole('alert').textContent).toContain('Station fehlt in stations.json')
  })
})
