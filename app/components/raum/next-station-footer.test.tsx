/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextStationFooter } from '@/components/raum/next-station-footer'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

const routerPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
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
  routerPush.mockClear()
})

describe('NextStationFooter', () => {
  it('überspringt besuchte Räume', () => {
    render(
      <NextStationFooter
        currentSlug="a"
        hubStations={HUB}
        mode="heft"
        unlockedSlugs={new Set(['a', 'b', 'c'])}
        visitedSlugs={new Set(['b'])}
      />,
    )
    expect(screen.getByText('Titel c')).toBeTruthy()
    expect(screen.queryByText('Titel b')).toBeNull()
  })

  it('rendert nichts, wenn alle anderen besucht sind', () => {
    const { container } = render(
      <NextStationFooter
        currentSlug="a"
        hubStations={HUB}
        mode="heft"
        unlockedSlugs={new Set(['a', 'b', 'c'])}
        visitedSlugs={new Set(['b', 'c'])}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
