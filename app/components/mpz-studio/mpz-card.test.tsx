/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MpzCard } from '@/components/mpz-studio/mpz-card'

afterEach(() => cleanup())

describe('MpzCard', () => {
  it('rendert default mit Studio-Card-Klassen', () => {
    render(<MpzCard data-testid="card">Inhalt</MpzCard>)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('rounded-mpz-card')
    expect(card.className).toContain('border-border-1')
    expect(card.className).toContain('bg-bg-2')
    expect(card.className).toContain('p-mpz-card-padding')
    expect(card.className).not.toContain('border-l-4')
    expect(card.className).not.toContain('shadow-')
  })

  it('rendert validation mit linkem Akzent-Streifen', () => {
    render(
      <MpzCard variant="validation" data-testid="card">
        OK
      </MpzCard>,
    )
    const card = screen.getByTestId('card')
    expect(card.className).toContain('border-l-4')
    expect(card.className).toContain('border-l-accent')
    expect(card.className).not.toContain('bg-accent')
  })

  it('rendert ohne Padding wenn padding=none', () => {
    render(
      <MpzCard padding="none" data-testid="card">
        Leer
      </MpzCard>,
    )
    expect(screen.getByTestId('card').className).not.toContain('p-mpz-card-padding')
  })

  it('merged className', () => {
    render(
      <MpzCard className="mt-2" data-testid="card">
        X
      </MpzCard>,
    )
    expect(screen.getByTestId('card').className).toContain('mt-2')
  })
})
