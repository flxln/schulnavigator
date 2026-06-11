/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'
const TOTAL_MS = 3400

function createStorageMock() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
  }
}

let mockNow = 0

async function advanceToDismiss() {
  const step = 50
  const steps = Math.ceil(TOTAL_MS / step) + 2
  for (let i = 0; i < steps; i++) {
    mockNow += step
    await vi.advanceTimersByTimeAsync(step)
  }
}

beforeEach(() => {
  mockNow = 0
  vi.stubGlobal('localStorage', createStorageMock())
  vi.spyOn(performance, 'now').mockImplementation(() => mockNow)
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    return window.setTimeout(() => cb(performance.now()), 0) as unknown as number
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id)
  })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  cleanup()
})

describe('PanOnboardingOverlay', () => {
  it('zeigt Hinweis beim ersten Besuch und blendet nach 3,4 s aus', async () => {
    render(<PanOnboardingOverlay />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    await act(async () => {
      await advanceToDismiss()
    })
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })

  it('erscheint nicht, wenn Merker in localStorage liegt', () => {
    localStorage.setItem(STORAGE_KEY, '1')
    render(<PanOnboardingOverlay />)
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })

  it('wird übersprungen wenn skip=true (iOS Gyro-Dialog)', () => {
    render(<PanOnboardingOverlay skip />)
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('startet nach skip true→false (iOS cached grant)', async () => {
    const { rerender } = render(<PanOnboardingOverlay skip />)
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()

    rerender(<PanOnboardingOverlay skip={false} />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    await act(async () => {
      await advanceToDismiss()
    })
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })

  it('blendet ordentlich aus wenn skip mitten in der Anzeige auf true wechselt (iOS Watchdog-Reset)', async () => {
    const { rerender } = render(<PanOnboardingOverlay skip={false} />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()

    rerender(<PanOnboardingOverlay skip />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()

    await act(async () => {
      await advanceToDismiss()
    })
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })
})
