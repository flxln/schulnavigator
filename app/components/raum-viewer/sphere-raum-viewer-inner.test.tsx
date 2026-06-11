/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Shared state between mock factories and tests — must be hoisted before imports.
const mocks = vi.hoisted(() => {
  const requestAccess = vi.fn().mockResolvedValue(undefined)
  const gyroStart = vi.fn().mockResolvedValue(undefined)
  const gyroIsEnabled = vi.fn().mockReturnValue(false)
  let _orientState = 'active'
  let _readyCb: (() => void) | null = null
  return {
    requestAccess,
    gyroStart,
    gyroIsEnabled,
    getOrientState: () => _orientState,
    setOrientState: (s: string) => { _orientState = s },
    fireViewerReady: () => { _readyCb?.() },
    storeReadyCb: (fn: () => void) => { _readyCb = fn },
  }
})

vi.mock('@photo-sphere-viewer/markers-plugin', () => ({
  MarkersPlugin: class MockMarkersPlugin {},
}))

vi.mock('@photo-sphere-viewer/gyroscope-plugin', () => ({
  GyroscopePlugin: class MockGyroscopePlugin {},
}))

vi.mock('@photo-sphere-viewer/core', async () => {
  const { MarkersPlugin } = await import('@photo-sphere-viewer/markers-plugin')
  const { GyroscopePlugin } = await import('@photo-sphere-viewer/gyroscope-plugin')
  const mockMarkersPlugin = {
    addEventListener: vi.fn(),
    clearMarkers: vi.fn(),
    addMarker: vi.fn(),
  }
  const mockGyroPlugin = {
    start: mocks.gyroStart,
    isEnabled: mocks.gyroIsEnabled,
  }
  return {
    Viewer: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'ready') mocks.storeReadyCb(handler)
      }),
      getPlugin: vi.fn().mockImplementation((Plugin: unknown) => {
        if (Plugin === MarkersPlugin) return mockMarkersPlugin
        if (Plugin === GyroscopePlugin) return mockGyroPlugin
        return null
      }),
      getSize: vi.fn(() => ({ width: 800, height: 400 })),
      setPanorama: vi.fn().mockResolvedValue(undefined),
      animate: vi.fn(),
      destroy: vi.fn(),
      dataHelper: { sphericalCoordsToViewerCoords: vi.fn(() => ({ x: 100, y: 100 })) },
    })),
  }
})

vi.mock('@/components/raum-viewer/use-device-orientation', () => ({
  useDeviceOrientation: () => ({
    state: mocks.getOrientState(),
    requestAccess: mocks.requestAccess,
    alpha: null,
    beta: null,
    gamma: null,
    panAngle: null,
    panAxis: 'alpha' as const,
    axisEpoch: 0,
  }),
}))

vi.mock('@/components/raum-viewer/pan-onboarding-overlay', () => ({
  PanOnboardingOverlay: ({ skip, mode }: { skip?: boolean; mode?: string }) => (
    <div data-testid="pan-onboarding" data-skip={String(skip ?? false)} data-mode={mode} />
  ),
}))

import { SphereRaumViewerInner } from '@/components/raum-viewer/sphere-raum-viewer-inner'

const DEFAULT_PROPS = {
  panorama: '/stations/360/musik.jpg',
  alt: 'Raumansicht Musikzimmer',
  medien: [],
  layout: 'hero' as const,
}

afterEach(cleanup)

beforeEach(() => {
  mocks.setOrientState('active')
  mocks.requestAccess.mockClear()
  mocks.gyroStart.mockClear()
  mocks.gyroIsEnabled.mockReturnValue(false)
})

describe('Gyro-Auto-Start', () => {
  it('startet Gyro nach viewer ready (Android/kein iOS-Dialog)', async () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    await act(async () => {
      mocks.fireViewerReady()
    })
    expect(mocks.gyroStart).toHaveBeenCalledOnce()
  })

  it('startet Gyro nicht erneut wenn bereits aktiv', async () => {
    mocks.gyroIsEnabled.mockReturnValue(true)
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    await act(async () => {
      mocks.fireViewerReady()
    })
    expect(mocks.gyroStart).not.toHaveBeenCalled()
  })

  it('startet Gyro nicht wenn orientationEnabled=false', async () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} orientationEnabled={false} />)
    await act(async () => {
      mocks.fireViewerReady()
    })
    expect(mocks.gyroStart).not.toHaveBeenCalled()
  })

  it('startet Gyro nicht wenn viewer nicht ready', () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    // ready not fired
    expect(mocks.gyroStart).not.toHaveBeenCalled()
  })
})

describe('iOS-Permission-Overlay', () => {
  it('zeigt Overlay bei needs-gesture im Hero-Layout', () => {
    mocks.setOrientState('needs-gesture')
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: 'Orientierung aktivieren' })).toBeTruthy()
    expect(mocks.gyroStart).not.toHaveBeenCalled()
  })

  it('zeigt kein Overlay im Default-Layout (kein Hero)', () => {
    mocks.setOrientState('needs-gesture')
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} layout="default" />)
    expect(screen.queryByRole('button', { name: 'Orientierung aktivieren' })).toBeNull()
  })

  it('zeigt kein Overlay wenn orientState active', () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.queryByRole('button', { name: 'Orientierung aktivieren' })).toBeNull()
  })

  it('ruft requestAccess nach Button-Klick auf', async () => {
    mocks.setOrientState('needs-gesture')
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Orientierung aktivieren' }))
    })
    expect(mocks.requestAccess).toHaveBeenCalledOnce()
  })
})

describe('PanOnboardingOverlay', () => {
  it('hat mode=sphere', () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('pan-onboarding').dataset.mode).toBe('sphere')
  })

  it('skip=false wenn orientState active', () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('pan-onboarding').dataset.skip).toBe('false')
  })

  it('skip=true wenn orientState needs-gesture', () => {
    mocks.setOrientState('needs-gesture')
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('pan-onboarding').dataset.skip).toBe('true')
  })
})
