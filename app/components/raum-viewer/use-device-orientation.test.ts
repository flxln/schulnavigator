/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeviceOrientation } from '@/components/raum-viewer/use-device-orientation'

describe('useDeviceOrientation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('startet mit checking', () => {
    const { result } = renderHook(() => useDeviceOrientation(true))
    expect(result.current.state).toBe('checking')
  })

  it('wechselt nach Microtask zu unsupported ohne DeviceOrientationEvent', async () => {
    vi.stubGlobal('DeviceOrientationEvent', undefined)
    const { result } = renderHook(() => useDeviceOrientation(true))
    await waitFor(() => {
      expect(result.current.state).toBe('unsupported')
    })
  })

  it('wechselt auf needs-gesture im iOS-Permission-Modell', async () => {
    class MockDeviceOrientationEvent {
      static requestPermission = vi.fn()
    }
    vi.stubGlobal('DeviceOrientationEvent', MockDeviceOrientationEvent)
    const { result } = renderHook(() => useDeviceOrientation(true))
    await waitFor(() => {
      expect(result.current.state).toBe('needs-gesture')
    })
  })

  it('wechselt auf active ohne iOS-Permission-Modell', async () => {
    class MockDeviceOrientationEvent {}
    vi.stubGlobal('DeviceOrientationEvent', MockDeviceOrientationEvent)
    const { result } = renderHook(() => useDeviceOrientation(true))
    await waitFor(() => {
      expect(result.current.state).toBe('active')
    })
  })
})
