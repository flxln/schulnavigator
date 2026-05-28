/** @vitest-environment jsdom */
import { createRef } from 'react'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RoomImagePane,
  type RoomImagePaneHandle,
} from '@/components/raum-viewer/room-image-pane'

vi.mock('next/image', () => ({
  default: ({
    onLoad,
    alt,
  }: {
    onLoad?: (e: { currentTarget: HTMLImageElement }) => void
    alt: string
  }) => {
    if (onLoad) {
      const img = document.createElement('img')
      Object.defineProperty(img, 'naturalWidth', { value: 3000 })
      Object.defineProperty(img, 'naturalHeight', { value: 1000 })
      queueMicrotask(() => onLoad({ currentTarget: img }))
    }
    return <img alt={alt} />
  },
}))

vi.mock('@/components/raum-viewer/use-device-orientation', () => ({
  useDeviceOrientation: () => ({
    state: 'active' as const,
    alpha: 10,
    gamma: 0,
    panAngle: 10,
    panAxis: 'alpha' as const,
    axisEpoch: 0,
    requestAccess: vi.fn(),
  }),
}))

beforeEach(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

describe('RoomImagePaneHandle', () => {
  it('exposes recenterView on the ref', async () => {
    const ref = createRef<RoomImagePaneHandle>()
    render(
      <RoomImagePane
        ref={ref}
        src="/stations/daz.jpg"
        alt="Test"
        medien={[]}
        layout="hero"
      />,
      {
        container: document.body.appendChild(
          Object.assign(document.createElement('div'), {
            style: { width: '400px', height: '400px' },
          }),
        ),
      },
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(ref.current?.recenterView).toBeTypeOf('function')
    expect(() => ref.current?.recenterView()).not.toThrow()
  })
})
