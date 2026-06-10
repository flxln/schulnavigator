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
    dialogUiActive: mocks.dialogUiActive,
    speakingRolle: 'frieda' as const,
    displayText: 'Test',
    tail: 'left' as const,
  }),
}))

vi.mock('@/hooks/use-visited-stations', () => ({
  useVisitedStations: () => ({ visitedSlugs: new Set<string>() }),
}))

vi.mock('@/components/raum-viewer', () => {
  const React = require('react') as typeof import('react')
  const RaumViewer = React.forwardRef(
    (_props: unknown, ref: React.Ref<{ recenterView: () => void }>) => {
      React.useImperativeHandle(ref, () => ({
        recenterView: vi.fn(),
      }))
      return <div data-testid="raum-viewer" />
    },
  )
  RaumViewer.displayName = 'RaumViewer'
  return {
    RaumViewer,
    RaumViewerErrorBoundary: ({ children }: { children: React.ReactNode }) =>
      children,
    StaticRoomFallback: () => null,
  }
})

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
    mocks.stopDialog.mockClear()
    mocks.routerPush.mockClear()
    mocks.dialogUiActive = true
  })

  afterEach(() => {
    cleanup()
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
