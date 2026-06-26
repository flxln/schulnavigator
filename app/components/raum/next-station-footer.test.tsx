/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextStationFooter } from '@/components/raum/next-station-footer'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function stub(slug: string, nr: number): HubStation {
  return {
    slug,
    titel: `Titel ${slug}`,
    nr,
    slotId: 'fenster-uc-l',
    kind: 'fenster',
    frame: [0, 0, 50, 50],
    accent: '#112233',
    visitedGlassFill: '#aabbcc',
  }
}

const HUB = [stub('a', 1), stub('b', 2), stub('c', 3)] as const

afterEach(() => {
  cleanup()
})

describe('NextStationFooter', () => {
  it('zeigt Scan-CTA, solange noch unbesuchte Stationen übrig sind', () => {
    render(
      <NextStationFooter
        currentSlug="a"
        hubStations={HUB}
        visitedSlugs={new Set(['b'])}
      />,
    )
    expect(screen.getByRole('button', { name: /Scanne einen beliebigen Code/i })).toBeTruthy()
    expect(screen.queryByText('Titel c')).toBeNull()
  })

  it('rendert nichts, wenn alle anderen besucht sind', () => {
    const { container } = render(
      <NextStationFooter
        currentSlug="a"
        hubStations={HUB}
        visitedSlugs={new Set(['b', 'c'])}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
