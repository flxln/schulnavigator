/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SphereStartblickCrosshair } from '@/components/mpz-studio/sphere-startblick-crosshair'

afterEach(() => {
  cleanup()
})

describe('SphereStartblickCrosshair', () => {
  it('rendert dekoratives Fadenkreuz ohne Pointer-Events', () => {
    const { container } = render(<SphereStartblickCrosshair />)
    const root = container.firstElementChild
    expect(root?.getAttribute('aria-hidden')).toBe('true')
    expect(root?.className).toContain('pointer-events-none')
  })
})
