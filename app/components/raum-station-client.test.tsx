/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RaumStationClient } from '@/components/raum-station-client'
import { buildHubStations } from '@/lib/schoolhouse-hub-map'
import { getAllStations, getStationBySlug } from '@/lib/stations'

const mocks = vi.hoisted(() => ({
  stopDialog: vi.fn(),
  routerPush: vi.fn(),
  dialogUiActive: true,
  coachBlocked: false,
  viewerGateBlocks: true,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.routerPush }),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/hooks/use-dialog-audio-playlist', () => ({
  useDialogAudioPlaylist: () => ({
    audioRef: { current: null },
    startFromUserGesture: vi.fn(),
    stopDialog: mocks.stopDialog,
    advanceFromUserGesture: vi.fn(),
    dialogUiActive: mocks.dialogUiActive,
    speakingRolle: 'frieda' as const,
    displayText: 'Test',
    tail: 'left' as const,
    currentSegmentIsTextOnly: false,
  }),
}))

vi.mock('@/hooks/use-visited-stations', () => ({
  useVisitedStations: () => ({ visitedSlugs: new Set<string>() }),
}))

vi.mock('@/hooks/use-coach-nudge', () => ({
  useCoachNudge: (opts: { blocked?: boolean }) => {
    mocks.coachBlocked = opts.blocked ?? false
    return {
      activeMessage: null,
      dismiss: vi.fn(),
      evaluated: true,
      coachOverlayOpen: false,
    }
  },
}))

vi.mock('@/components/raum-viewer', () => {
  const React = require('react') as typeof import('react')
  const RaumViewer = React.forwardRef(
    (
      props: { onViewerCoachGateChange?: (blocks: boolean) => void },
      ref: React.Ref<{ recenterView: () => void }>,
    ) => {
      React.useEffect(() => {
        props.onViewerCoachGateChange?.(mocks.viewerGateBlocks)
      }, [props.onViewerCoachGateChange])
      React.useImperativeHandle(ref, () => ({
        recenterView: vi.fn(),
      }))
      return <div data-testid="raum-viewer" />
    },
  )
  RaumViewer.displayName = 'RaumViewer'
  const SphereRaumViewer = React.forwardRef(
    (
      props: { onViewerCoachGateChange?: (blocks: boolean) => void },
      ref: React.Ref<{ recenterView: () => void }>,
    ) => {
      React.useEffect(() => {
        props.onViewerCoachGateChange?.(mocks.viewerGateBlocks)
      }, [props.onViewerCoachGateChange])
      React.useImperativeHandle(ref, () => ({
        recenterView: vi.fn(),
        projectHotspot: vi.fn(() => null),
      }))
      return <div data-testid="sphere-raum-viewer" />
    },
  )
  SphereRaumViewer.displayName = 'SphereRaumViewer'
  return {
    RaumViewer,
    SphereRaumViewer,
    RaumViewerErrorBoundary: ({ children }: { children: React.ReactNode }) =>
      children,
    StaticRoomFallback: () => null,
  }
})

function stubBrowserLayoutApis() {
  class ResizeObserverMock {
    constructor(_cb: ResizeObserverCallback) {}
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

function renderDaz() {
  const station = getStationBySlug('daz')
  if (!station) {
    throw new Error('daz station missing')
  }
  const hubStations = buildHubStations(getAllStations())
  const hubStation = hubStations.find((s) => s.slug === 'daz')
  if (!hubStation) {
    throw new Error('daz hub station missing')
  }
  return render(
    <RaumStationClient
      station={station}
      validSlugs={getAllStations().map((s) => s.slug)}
      hubStation={hubStation}
      hubStations={hubStations}
      mode="heft"
    />,
  )
}

describe('RaumStationClient dialog chrome', () => {
  beforeEach(() => {
    stubBrowserLayoutApis()
    mocks.stopDialog.mockClear()
    mocks.routerPush.mockClear()
    mocks.dialogUiActive = true
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows Dialog beenden when dialogUiActive', () => {
    renderDaz()
    expect(screen.getByLabelText('Dialog beenden')).toBeTruthy()
  })

  it('hides Dialog beenden when dialog is inactive', () => {
    mocks.dialogUiActive = false
    renderDaz()
    expect(screen.queryByLabelText('Dialog beenden')).toBeNull()
  })

  it('calls stopDialog when Dialog beenden is clicked', () => {
    renderDaz()
    fireEvent.click(screen.getByLabelText('Dialog beenden'))
    expect(mocks.stopDialog).toHaveBeenCalledTimes(1)
  })

  it('calls stopDialog before navigate on Zurück during dialog', () => {
    renderDaz()
    fireEvent.click(screen.getByLabelText('Zurück'))
    expect(mocks.stopDialog).toHaveBeenCalledTimes(1)
    expect(mocks.routerPush).toHaveBeenCalledTimes(1)
    const stopOrder = mocks.stopDialog.mock.invocationCallOrder[0]
    const pushOrder = mocks.routerPush.mock.invocationCallOrder[0]
    expect(stopOrder).toBeLessThan(pushOrder)
  })
})

describe('RaumStationClient card peek (body scroll)', () => {
  beforeEach(() => {
    stubBrowserLayoutApis()
    mocks.dialogUiActive = false
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renders station title and description in the content card', () => {
    const station = getStationBySlug('pc-raum')
    if (!station) throw new Error('pc-raum missing')
    const hubStations = buildHubStations(getAllStations())
    const hubStation = hubStations.find((s) => s.slug === 'pc-raum')!
    render(
      <RaumStationClient
        station={station}
        validSlugs={getAllStations().map((s) => s.slug)}
        hubStation={hubStation}
        hubStations={hubStations}
        mode="heft"
      />,
    )
    expect(screen.getByRole('heading', { name: /PC-RAUM/i })).toBeTruthy()
    expect(screen.getByText(station.beschreibung)).toBeTruthy()
  })
})

describe('RaumStationClient Coach-Gate', () => {
  beforeEach(() => {
    stubBrowserLayoutApis()
    mocks.dialogUiActive = false
    mocks.viewerGateBlocks = true
    mocks.coachBlocked = false
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  function renderKlassenzimmer() {
    const station = getStationBySlug('klassenzimmer')
    if (!station) throw new Error('klassenzimmer missing')
    const hubStations = buildHubStations(getAllStations())
    const hubStation = hubStations.find((s) => s.slug === 'klassenzimmer')!
    return render(
      <RaumStationClient
        station={station}
        validSlugs={getAllStations().map((s) => s.slug)}
        hubStation={hubStation}
        hubStations={hubStations}
        mode="heft"
      />,
    )
  }

  it('blockiert Coach solange Viewer-Gate aktiv ist', async () => {
    mocks.viewerGateBlocks = true
    renderKlassenzimmer()
    await vi.waitFor(() => {
      expect(mocks.coachBlocked).toBe(true)
    })
  })

  it('gibt Coach frei wenn Viewer-Gate false meldet', async () => {
    mocks.viewerGateBlocks = false
    renderKlassenzimmer()
    await vi.waitFor(() => {
      expect(mocks.coachBlocked).toBe(false)
    })
  })
})
