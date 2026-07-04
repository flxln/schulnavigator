/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LegalFooter } from '@/components/legal/legal-footer'

const usePathname = vi.fn(() => '/')

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}))

afterEach(() => {
  cleanup()
})

describe('LegalFooter', () => {
  it('rendert Impressum- und Datenschutz-Links auf der Startseite', () => {
    usePathname.mockReturnValue('/')
    render(<LegalFooter />)

    expect(screen.getByRole('link', { name: 'Impressum' }).getAttribute('href')).toBe(
      '/impressum',
    )
    expect(
      screen.getByRole('link', { name: 'Datenschutz' }).getAttribute('href'),
    ).toBe('/datenschutz')
  })

  it('blendet sich auf Legal-Seiten aus', () => {
    usePathname.mockReturnValue('/impressum')
    const { container } = render(<LegalFooter />)
    expect(container.innerHTML).toBe('')
  })

  it('blendet sich auf MPZ-Studio-Pfaden aus', () => {
    usePathname.mockReturnValue('/mpz/studio')
    const { container } = render(<LegalFooter />)
    expect(container.innerHTML).toBe('')
  })
})
