/** @vitest-environment jsdom */
import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'

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

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorageMock())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  cleanup()
})

describe('PanOnboardingOverlay', () => {
  it('zeigt Hinweis beim ersten Besuch und blendet aus', () => {
    render(<PanOnboardingOverlay />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    act(() => {
      vi.advanceTimersByTime(400)
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
})
