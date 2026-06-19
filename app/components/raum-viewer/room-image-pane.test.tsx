/** @vitest-environment jsdom */
import { createRef, type ComponentProps } from 'react'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RoomImagePane,
  type RoomImagePaneHandle,
} from '@/components/raum-viewer/room-image-pane'
import { panPxFromStartPanX } from '@/lib/raum-viewer/viewport-center'
import {
  MIN_PAN_DISPLAY_RATIO,
  maxPanPx,
} from '@/lib/raum-viewer/constants'
import { centeredPanPx } from '@/lib/raum-viewer/pan-from-orientation'
import { roomPanZoom } from '@/lib/raum-viewer/room-pan-zoom'

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
    beta: 85,
    gamma: 0,
    panAngle: 10,
    panAxis: 'alpha' as const,
    axisEpoch: 0,
    requestAccess: vi.fn(),
  }),
}))

const CONTAINER_W = 400
const CONTAINER_H = 400
const NATURAL_W = 3000
const NATURAL_H = 1000

function layoutMetrics() {
  const { effectiveDisplayW } = roomPanZoom(
    NATURAL_W,
    NATURAL_H,
    CONTAINER_W,
    CONTAINER_H,
    MIN_PAN_DISPLAY_RATIO,
  )
  const maxPan = maxPanPx(effectiveDisplayW, CONTAINER_W)
  return { effectiveDisplayW, maxPan }
}

function makeResizeEntry(target: Element): ResizeObserverEntry {
  return {
    contentRect: {
      width: CONTAINER_W,
      height: CONTAINER_H,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: CONTAINER_H,
      right: CONTAINER_W,
      toJSON: () => ({}),
    },
    target,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  } as ResizeObserverEntry
}

beforeEach(() => {
  class ResizeObserverMock {
    private readonly cb: ResizeObserverCallback

    constructor(cb: ResizeObserverCallback) {
      this.cb = cb
    }

    observe(el: Element) {
      this.cb([makeResizeEntry(el)], this as unknown as ResizeObserver)
    }

    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

function getPanTransform(container: HTMLElement): string {
  const el = container.querySelector('.will-change-transform') as HTMLElement | null
  expect(el).not.toBeNull()
  return el!.style.transform
}

function renderPane(
  props: Partial<ComponentProps<typeof RoomImagePane>> = {},
) {
  const container = document.createElement('div')
  Object.assign(container.style, { width: `${CONTAINER_W}px`, height: '400px' })
  document.body.appendChild(container)
  const ref = createRef<RoomImagePaneHandle>()
  render(
    <RoomImagePane
      ref={ref}
      src="/stations/kunst.jpg"
      alt="Test"
      medien={[]}
      layout="hero"
      {...props}
    />,
    { container },
  )
  return { ref, container }
}

describe('RoomImagePaneHandle', () => {
  it('exposes recenterView on the ref', async () => {
    const { ref } = renderPane()

    await act(async () => {
      await Promise.resolve()
    })

    expect(ref.current?.recenterView).toBeTypeOf('function')
    expect(() => ref.current?.recenterView()).not.toThrow()
  })
})

describe('RoomImagePane startPanX (ADR-024)', () => {
  it('wendet startPanX nach Layout einmalig an', async () => {
    const startPanX = 0.9
    const { effectiveDisplayW, maxPan } = layoutMetrics()
    const expected = panPxFromStartPanX(
      startPanX,
      CONTAINER_W,
      effectiveDisplayW,
      maxPan,
    )

    const { container } = renderPane({ startPanX })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(getPanTransform(container)).toContain(`translate(${expected}px`)
  })

  it('wendet startPanX nicht erneut bei zweitem Layout-Tick an', async () => {
    const startPanX = 0.5
    const { ref, container } = renderPane({ startPanX })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      ref.current?.recenterView()
    })

    const transformAfterRecenter = getPanTransform(container)

    await act(async () => {
      window.dispatchEvent(new Event('resize'))
      await Promise.resolve()
    })

    expect(getPanTransform(container)).toBe(transformAfterRecenter)
  })

  it('recenterView ohne startPanX nutzt Legacy-Zentrierung', async () => {
    const { ref, container } = renderPane()
    const { maxPan } = layoutMetrics()

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      ref.current?.recenterView()
    })

    const expected = centeredPanPx(maxPan)
    expect(getPanTransform(container)).toContain(`translate(${expected}px`)
  })

  it('recenterView mit startPanX springt auf Start-Pan', async () => {
    const startPanX = 0.9
    const { effectiveDisplayW, maxPan } = layoutMetrics()
    const expected = panPxFromStartPanX(
      startPanX,
      CONTAINER_W,
      effectiveDisplayW,
      maxPan,
    )
    const { ref, container } = renderPane({ startPanX })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    await act(async () => {
      ref.current?.recenterView()
    })

    expect(getPanTransform(container)).toContain(`translate(${expected}px`)
  })
})
