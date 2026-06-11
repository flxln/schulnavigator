/** @vitest-environment jsdom */
import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PanOnboardingOverlay } from '@/components/raum-viewer/pan-onboarding-overlay'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'
const VISIBLE_MS = 3000
const FADE_MS = 400

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
  it('zeigt Hinweis beim ersten Besuch und blendet nach 3 s aus', () => {
    render(<PanOnboardingOverlay />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()
    // Merker noch nicht gesetzt — erst bei visible→fading
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    act(() => { vi.advanceTimersByTime(VISIBLE_MS) })
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    act(() => { vi.advanceTimersByTime(FADE_MS) })
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

  it('startet nach skip true→false (iOS cached grant)', () => {
    const { rerender } = render(<PanOnboardingOverlay skip />)
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()

    rerender(<PanOnboardingOverlay skip={false} />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()

    act(() => { vi.advanceTimersByTime(VISIBLE_MS) })
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    act(() => { vi.advanceTimersByTime(FADE_MS) })
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })

  it('blendet ordentlich aus wenn skip mitten in der Anzeige auf true wechselt (iOS Watchdog-Reset)', () => {
    const { rerender } = render(<PanOnboardingOverlay skip={false} />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()

    // iOS-Watchdog setzt skip zurück auf true — darf die Timer nicht abreißen
    rerender(<PanOnboardingOverlay skip />)
    expect(screen.getByText('Links oder rechts wischen')).toBeTruthy()

    act(() => { vi.advanceTimersByTime(VISIBLE_MS) })
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1')

    act(() => { vi.advanceTimersByTime(FADE_MS) })
    expect(screen.queryByText('Links oder rechts wischen')).toBeNull()
  })
})
