/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CoachMessage } from '@/lib/types'

const mocks = vi.hoisted(() => ({
  markCoachSeen: vi.fn(),
  markCoachSuperseded: vi.fn(),
  readCoachSeenState: vi.fn(() => ({
    version: 1 as const,
    seen: [] as string[],
    suppressed: [] as string[],
  })),
  resolveRoomCoachMessage: vi.fn(),
}))

vi.mock('@/lib/coach-seen', () => ({
  markCoachSeen: mocks.markCoachSeen,
  markCoachSuperseded: mocks.markCoachSuperseded,
  readCoachSeenState: mocks.readCoachSeenState,
}))

vi.mock('@/lib/coach-triggers', () => ({
  resolveHubCoachMessage: vi.fn(() => null),
  resolveRoomCoachMessage: mocks.resolveRoomCoachMessage,
}))

import { useCoachNudge } from '@/hooks/use-coach-nudge'

const ROOM_MESSAGE: CoachMessage = {
  id: 'room-first-klassenzimmer',
  trigger: 'room-first',
  mascot: 'frieda',
  placement: 'left',
  text: 'Schau dich um!',
  slug: 'klassenzimmer',
}

describe('useCoachNudge', () => {
  beforeEach(() => {
    mocks.markCoachSeen.mockClear()
    mocks.markCoachSuperseded.mockClear()
    mocks.readCoachSeenState.mockClear()
    mocks.resolveRoomCoachMessage.mockReturnValue({
      message: ROOM_MESSAGE,
      supersededIds: [],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('zeigt Room-Coach wenn nicht blockiert', async () => {
    const { result } = renderHook(() =>
      useCoachNudge({
        surface: 'room',
        slug: 'klassenzimmer',
        mode: 'heft',
        blocked: false,
      }),
    )

    await waitFor(() => {
      expect(result.current.activeMessage?.id).toBe('room-first-klassenzimmer')
    })
    await waitFor(() => {
      expect(mocks.markCoachSeen).toHaveBeenCalledWith(
        'room-first-klassenzimmer',
        'heft',
      )
    })
  })

  it('zeigt keinen Coach solange blocked', async () => {
    const { result, rerender } = renderHook(
      ({ blocked }) =>
        useCoachNudge({
          surface: 'room',
          slug: 'klassenzimmer',
          mode: 'heft',
          blocked,
        }),
      { initialProps: { blocked: true } },
    )

    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.activeMessage).toBeNull()
    expect(mocks.markCoachSeen).not.toHaveBeenCalled()

    rerender({ blocked: false })
    await waitFor(() => {
      expect(result.current.activeMessage?.id).toBe('room-first-klassenzimmer')
    })
  })

  it('blendet aktiven Coach aus wenn blocked wird', async () => {
    const { result, rerender } = renderHook(
      ({ blocked }) =>
        useCoachNudge({
          surface: 'room',
          slug: 'klassenzimmer',
          mode: 'heft',
          blocked,
        }),
      { initialProps: { blocked: false } },
    )

    await waitFor(() => {
      expect(result.current.activeMessage).not.toBeNull()
    })
    expect(mocks.markCoachSeen).toHaveBeenCalled()

    rerender({ blocked: true })
    await waitFor(() => {
      expect(result.current.activeMessage).toBeNull()
    })
  })

  it('persistiert nicht als seen solange durchgehend blockiert', async () => {
    const { result, rerender } = renderHook(
      ({ blocked }) =>
        useCoachNudge({
          surface: 'room',
          slug: 'klassenzimmer',
          mode: 'heft',
          blocked,
        }),
      { initialProps: { blocked: true } },
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.activeMessage).toBeNull()
    expect(mocks.markCoachSeen).not.toHaveBeenCalled()

    rerender({ blocked: false })
    await waitFor(() => {
      expect(mocks.markCoachSeen).toHaveBeenCalled()
    })
  })
})
