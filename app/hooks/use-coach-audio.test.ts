import { renderHook, act, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCoachAudio } from '@/hooks/use-coach-audio'

describe('useCoachAudio', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setupAudio() {
    const audioRef = createRef<HTMLAudioElement>()
    const el = document.createElement('audio')
    audioRef.current = el
    return { audioRef, el }
  }

  it('startet Autoplay bei quelle', async () => {
    const { audioRef, el } = setupAudio()
    const playSpy = vi.spyOn(el, 'play').mockResolvedValue(undefined)

    renderHook(() => useCoachAudio('/api/coach/welcome-hub', audioRef))

    expect(playSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(el.src).toContain('/api/coach/welcome-hub')
    })
  })

  it('setzt playBlocked bei play()-Reject', async () => {
    const { audioRef, el } = setupAudio()
    vi.spyOn(el, 'play').mockRejectedValue(
      new DOMException('blocked', 'NotAllowedError'),
    )

    const { result } = renderHook(() =>
      useCoachAudio('/api/coach/welcome-hub', audioRef),
    )

    await waitFor(() => {
      expect(result.current.playBlocked).toBe(true)
    })
  })

  it('ignoriert AbortError beim Unmount während pending play', async () => {
    const { audioRef, el } = setupAudio()
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

    const { unmount } = renderHook(() =>
      useCoachAudio('/api/coach/welcome-hub', audioRef),
    )

    unmount()

    await waitFor(() => {
      expect(el.getAttribute('src')).toBeNull()
    })
  })

  it('replay ruft play erneut auf', async () => {
    const { audioRef, el } = setupAudio()
    const playSpy = vi
      .spyOn(el, 'play')
      .mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
      .mockResolvedValueOnce(undefined)

    const { result } = renderHook(() =>
      useCoachAudio('/api/coach/welcome-hub', audioRef),
    )

    await waitFor(() => {
      expect(result.current.playBlocked).toBe(true)
    })

    act(() => {
      result.current.replay()
    })

    expect(playSpy).toHaveBeenCalledTimes(2)
  })

  it('startet Autoplay erst wenn enabled und audioRef gesetzt sind', async () => {
    const audioRef = createRef<HTMLAudioElement>()
    const el = document.createElement('audio')
    const playSpy = vi.spyOn(el, 'play').mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useCoachAudio('/api/coach/welcome-hub', audioRef, enabled),
      { initialProps: { enabled: false } },
    )

    expect(playSpy).not.toHaveBeenCalled()

    audioRef.current = el
    rerender({ enabled: true })

    expect(playSpy).toHaveBeenCalled()
    await waitFor(() => {
      expect(el.src).toContain('/api/coach/welcome-hub')
    })
  })

  it('no-op ohne quelle', () => {
    const { audioRef, el } = setupAudio()
    const playSpy = vi.spyOn(el, 'play')

    renderHook(() => useCoachAudio(undefined, audioRef))

    expect(playSpy).not.toHaveBeenCalled()
  })
})
