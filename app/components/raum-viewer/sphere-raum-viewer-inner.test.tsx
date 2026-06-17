/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Shared state between mock factories and tests — must be hoisted before imports.
const mocks = vi.hoisted(() => {
  const requestAccess = vi.fn().mockResolvedValue(undefined)
  const gyroStart = vi.fn().mockResolvedValue(undefined)
  const gyroIsEnabled = vi.fn().mockReturnValue(false)
  let _orientState = 'active'
  let _readyCb: (() => void) | null = null
  let _viewerConfig: Record<string, unknown> | null = null
  let _viewerInstance: {
    rotate: ReturnType<typeof vi.fn>
    animate: ReturnType<typeof vi.fn>
    setPanorama: ReturnType<typeof vi.fn>
  } | null = null
  return {
    requestAccess,
    gyroStart,
    gyroIsEnabled,
    getOrientState: () => _orientState,
    setOrientState: (s: string) => { _orientState = s },
    fireViewerReady: () => { _readyCb?.() },
    storeReadyCb: (fn: () => void) => { _readyCb = fn },
    getViewerConfig: () => _viewerConfig,
    storeViewerConfig: (config: Record<string, unknown>) => { _viewerConfig = config },
    getViewerInstance: () => _viewerInstance,
    storeViewerInstance: (instance: typeof _viewerInstance) => { _viewerInstance = instance },
    searchParams: new URLSearchParams() as URLSearchParams,
  }
})

vi.mock('@photo-sphere-viewer/markers-plugin', () => ({
  MarkersPlugin: class MockMarkersPlugin {},
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
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
    updateMarker: vi.fn(),
    removeMarker: vi.fn(),
  }
  const mockGyroPlugin = {
    start: mocks.gyroStart,
    isEnabled: mocks.gyroIsEnabled,
    isSupported: vi.fn().mockResolvedValue(true),
    state: { isSupported: Promise.resolve(true) },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  return {
    Viewer: vi.fn().mockImplementation((config: Record<string, unknown>) => {
      mocks.storeViewerConfig(config)
      const rotate = vi.fn()
      const animate = vi.fn()
      const setPanorama = vi.fn().mockResolvedValue(undefined)
      const instance = {
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'ready') mocks.storeReadyCb(handler)
      }),
      getPlugin: vi.fn().mockImplementation((Plugin: unknown) => {
        if (Plugin === MarkersPlugin) return mockMarkersPlugin
        if (Plugin === GyroscopePlugin) return mockGyroPlugin
        return null
      }),
      getSize: vi.fn(() => ({ width: 800, height: 400 })),
      setPanorama,
      rotate,
      animate,
      destroy: vi.fn(),
      dataHelper: { sphericalCoordsToViewerCoords: vi.fn(() => ({ x: 100, y: 100 })) },
      }
      mocks.storeViewerInstance(instance)
      return instance
    }),
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
import {
  SPHERE_LOCKED_FOV_DEG,
  SPHERE_LOCKED_FOV_EPSILON_DEG,
} from '@/lib/raum-viewer/constants'
import type { Hotspot360, StationViewerHandle } from '@/lib/types'

const HOTSPOTS: Hotspot360[] = [
  {
    id: 'hs-frieda',
    yaw: 0,
    pitch: -20,
    action: 'dialog',
    mascot: 'frieda',
  },
  {
    id: 'hs-icon',
    yaw: 10,
    pitch: 0,
    mediumId: 'm1',
    icon: '/icon.svg',
  },
]

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
  mocks.storeViewerConfig({})
  mocks.storeViewerInstance(null)
  mocks.searchParams = new URLSearchParams()
})

describe('Config-Smoke-Test (Zoom-Sperre)', () => {
  it('übergibt festes FOV und deaktiviertes Mausrad an PSV Viewer', () => {
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    const config = mocks.getViewerConfig()
    expect(config).not.toBeNull()
    expect(config!.minFov).toBe(SPHERE_LOCKED_FOV_DEG - SPHERE_LOCKED_FOV_EPSILON_DEG)
    expect(config!.maxFov).toBe(SPHERE_LOCKED_FOV_DEG)
    expect(config!.minFov).toBeLessThan(config!.maxFov as number)
    expect(config!.defaultZoomLvl).toBe(0)
    expect(config!.mousewheel).toBe(false)
  })
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

  it('startet Gyro nach Ein-Finger-Wisch neu wenn vorher aktiv', async () => {
    mocks.gyroIsEnabled.mockReturnValue(true)
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    await act(async () => {
      mocks.fireViewerReady()
    })
    mocks.gyroStart.mockClear()

    const touchTarget = screen
      .getByLabelText('Raumansicht Musikzimmer')
      .querySelector('.h-full') as HTMLElement
    expect(touchTarget).toBeTruthy()

    await act(async () => {
      fireEvent.touchStart(touchTarget, {
        touches: [{ clientX: 100, clientY: 100 }],
      })
      mocks.gyroIsEnabled.mockReturnValue(false)
      fireEvent.touchEnd(touchTarget, { touches: [] })
    })

    expect(mocks.gyroStart).toHaveBeenCalledOnce()
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

  it('skip=true wenn orientState checking', () => {
    mocks.setOrientState('checking')
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('pan-onboarding').dataset.skip).toBe('true')
  })
})

describe('ViewerCoachGate', () => {
  it('meldet onViewerCoachGateChange(true) bei needs-gesture', () => {
    const onGate = vi.fn()
    mocks.setOrientState('needs-gesture')
    render(
      <SphereRaumViewerInner
        {...DEFAULT_PROPS}
        onViewerCoachGateChange={onGate}
      />,
    )
    expect(onGate).toHaveBeenCalledWith(true)
  })

  it('meldet onViewerCoachGateChange(false) bei active ohne Pan', () => {
    const onGate = vi.fn()
    render(
      <SphereRaumViewerInner
        {...DEFAULT_PROPS}
        onViewerCoachGateChange={onGate}
      />,
    )
    expect(onGate).toHaveBeenCalledWith(false)
  })

  it('meldet onViewerCoachGateChange(false) bei unsupported', () => {
    const onGate = vi.fn()
    mocks.setOrientState('unsupported')
    render(
      <SphereRaumViewerInner
        {...DEFAULT_PROPS}
        onViewerCoachGateChange={onGate}
      />,
    )
    expect(onGate).toHaveBeenCalledWith(false)
  })
})

describe('Sphere-Marker (Layer + Lifecycle)', () => {
  it('nutzt imageLayer für Medien und element für Maskottchen', async () => {
    const { Viewer } = await import('@photo-sphere-viewer/core')
    const viewerInstance = vi.mocked(Viewer).mock.results.at(-1)?.value as {
      getPlugin: ReturnType<typeof vi.fn>
    }
    const plugin = viewerInstance.getPlugin.mock.results[0]?.value as {
      addMarker: ReturnType<typeof vi.fn>
      updateMarker: ReturnType<typeof vi.fn>
      removeMarker: ReturnType<typeof vi.fn>
    }

    render(
      <SphereRaumViewerInner
        {...DEFAULT_PROPS}
        hotspots360={HOTSPOTS}
        medien={[]}
        activeHotspotId="hs-frieda"
      />,
    )
    await act(async () => {
      mocks.fireViewerReady()
    })

    expect(plugin.addMarker).toHaveBeenCalledTimes(2)
    const configs = plugin.addMarker.mock.calls.map((c) => c[0])
    expect(configs.some((c) => c.imageLayer === '/icon.svg')).toBe(true)
    expect(configs.some((c) => c.element instanceof HTMLElement)).toBe(true)
    expect(plugin.clearMarkers).not.toHaveBeenCalled()
    expect(plugin.updateMarker).toHaveBeenCalled()
  })
})

describe('Hotspot-Kalibrierung (Query-Parameter)', () => {
  it('zeigt Overlay bei ?hotspot-calib=1 und stationSlug in development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    mocks.searchParams = new URLSearchParams('hotspot-calib=1')
    render(
      <SphereRaumViewerInner {...DEFAULT_PROPS} stationSlug="klassenzimmer" />,
    )
    expect(screen.getByText('Hotspot-Kalibrierung (Dev)')).toBeTruthy()
    vi.unstubAllEnvs()
  })

  it('zeigt kein Overlay ohne hotspot-calib Query-Parameter', () => {
    vi.stubEnv('NODE_ENV', 'development')
    mocks.searchParams = new URLSearchParams()
    render(
      <SphereRaumViewerInner {...DEFAULT_PROPS} stationSlug="klassenzimmer" />,
    )
    expect(screen.queryByText('Hotspot-Kalibrierung (Dev)')).toBeNull()
    vi.unstubAllEnvs()
  })

  it('reagiert auf geänderte Search-Params (Navigation-Simulation)', () => {
    vi.stubEnv('NODE_ENV', 'development')
    mocks.searchParams = new URLSearchParams()
    const { rerender } = render(
      <SphereRaumViewerInner {...DEFAULT_PROPS} stationSlug="klassenzimmer" />,
    )
    expect(screen.queryByText('Hotspot-Kalibrierung (Dev)')).toBeNull()

    mocks.searchParams = new URLSearchParams('hotspot-calib=1')
    rerender(
      <SphereRaumViewerInner {...DEFAULT_PROPS} stationSlug="klassenzimmer" />,
    )
    expect(screen.getByText('Hotspot-Kalibrierung (Dev)')).toBeTruthy()
    vi.unstubAllEnvs()
  })
})

describe('Sphere-Startblick (ADR-023)', () => {
  async function flushPanoramaLoad() {
    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      await Promise.resolve()
    })
  }

  it('ruft rotate nach setPanorama mit startYaw/startPitch auf', async () => {
    render(
      <SphereRaumViewerInner {...DEFAULT_PROPS} startYaw={30} startPitch={-5} />,
    )
    await flushPanoramaLoad()
    const viewer = mocks.getViewerInstance()
    expect(viewer?.setPanorama).toHaveBeenCalledWith(DEFAULT_PROPS.panorama)
    expect(viewer?.rotate).toHaveBeenCalledWith({
      yaw: expect.closeTo((30 * Math.PI) / 180, 4),
      pitch: expect.closeTo((-5 * Math.PI) / 180, 4),
    })
  })

  it('recenterView animiert zum Startblick statt 0/0', async () => {
    const ref = createRef<StationViewerHandle>()
    render(
      <SphereRaumViewerInner
        {...DEFAULT_PROPS}
        ref={ref}
        startYaw={45}
        startPitch={-10}
      />,
    )
    await act(async () => {
      mocks.fireViewerReady()
      await Promise.resolve()
    })
    const viewer = mocks.getViewerInstance()
    viewer?.animate.mockClear()
    act(() => {
      ref.current?.recenterView()
    })
    expect(viewer?.animate).toHaveBeenCalledWith({
      yaw: expect.closeTo((45 * Math.PI) / 180, 4),
      pitch: expect.closeTo((-10 * Math.PI) / 180, 4),
      speed: '3rpm',
    })
  })

  it('recenterView ohne Startblick bleibt bei 0/0', async () => {
    const ref = createRef<StationViewerHandle>()
    render(<SphereRaumViewerInner {...DEFAULT_PROPS} ref={ref} />)
    await act(async () => {
      mocks.fireViewerReady()
      await Promise.resolve()
    })
    const viewer = mocks.getViewerInstance()
    viewer?.animate.mockClear()
    act(() => {
      ref.current?.recenterView()
    })
    expect(viewer?.animate).toHaveBeenCalledWith({
      yaw: 0,
      pitch: 0,
      speed: '3rpm',
    })
  })
})
