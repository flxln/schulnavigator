import { renderHook, act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AUDIO_UNLOCK_EVENT,
  resetAudioPlaybackUnlockForTests,
} from '@/lib/audio-autoplay-unlock'
import { useCoachAudio } from '@/hooks/use-coach-audio'

describe('useCoachAudio', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    resetAudioPlaybackUnlockForTests()
  })

  function mountAudio(
    result: ReturnType<typeof renderHook<ReturnType<typeof useCoachAudio>>>,
    el: HTMLAudioElement,
  ) {
    act(() => {
      result.result.current.audioRef(el)
    })
  }

  it('startet Autoplay bei quelle', async () => {
    const el = document.createElement('audio')
    const playSpy = vi.spyOn(el, 'play').mockResolvedValue(undefined)

    const result = renderHook(() => useCoachAudio('/api/coach/welcome-hub'))
    mountAudio(result, el)

    expect(playSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(el.src).toContain('/api/coach/welcome-hub')
    })
  })

  it('setzt playBlocked bei play()-Reject', async () => {
    const el = document.createElement('audio')
    vi.spyOn(el, 'play').mockRejectedValue(
      new DOMException('blocked', 'NotAllowedError'),
    )

    const result = renderHook(() => useCoachAudio('/api/coach/welcome-hub'))
    mountAudio(result, el)

    await waitFor(() => {
      expect(result.result.current.playBlocked).toBe(true)
    })
  })

  it('ignoriert AbortError beim Unmount während pending play', async () => {
    const el = document.createElement('audio')
    let rejectPlay: ((err: DOMException) => void) | undefined
    vi.spyOn(el, 'play').mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectPlay = reject
        }),
    )
    vi.spyOn(el, 'pause').mockImplementation(() => {
      rejectPlay?.(new DOMException('interrupted', 'AbortError'))
    })

    const result = renderHook(() => useCoachAudio('/api/coach/welcome-hub'))
    mountAudio(result, el)
    result.unmount()

    await waitFor(() => {
      expect(el.getAttribute('src')).toBeNull()
    })
  })

  it('replay ruft play erneut auf', async () => {
    const el = document.createElement('audio')
    const playSpy = vi
      .spyOn(el, 'play')
      .mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
      .mockResolvedValueOnce(undefined)

    const result = renderHook(() => useCoachAudio('/api/coach/welcome-hub'))
    mountAudio(result, el)

    await waitFor(() => {
      expect(result.result.current.playBlocked).toBe(true)
    })

    act(() => {
      result.result.current.replay()
    })

    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('startet Autoplay erst wenn enabled und audio-Element gesetzt sind', async () => {
    const el = document.createElement('audio')
    const playSpy = vi.spyOn(el, 'play').mockResolvedValue(undefined)

    const result = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useCoachAudio('/api/coach/welcome-hub', enabled),
      { initialProps: { enabled: false } },
    )

    expect(playSpy).not.toHaveBeenCalled()

    mountAudio(result, el)
    result.rerender({ enabled: true })

    expect(playSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(el.src).toContain('/api/coach/welcome-hub')
    })
  })

  it('versucht erneut nach Audio-Unlock-Event', async () => {
    const el = document.createElement('audio')
    const playSpy = vi
      .spyOn(el, 'play')
      .mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
      .mockResolvedValueOnce(undefined)

    const result = renderHook(() => useCoachAudio('/api/coach/welcome-hub'))
    mountAudio(result, el)

    await waitFor(() => {
      expect(result.result.current.playBlocked).toBe(true)
    })

    act(() => {
      window.dispatchEvent(new CustomEvent(AUDIO_UNLOCK_EVENT))
    })

    await waitFor(() => {
      expect(result.result.current.isPlaying).toBe(true)
      expect(result.result.current.playBlocked).toBe(false)
    })
    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('no-op ohne quelle', () => {
    const el = document.createElement('audio')
    const playSpy = vi.spyOn(el, 'play')

    const result = renderHook(() => useCoachAudio(undefined))
    mountAudio(result, el)

    expect(playSpy).not.toHaveBeenCalled()
  })
})
