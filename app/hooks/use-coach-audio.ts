'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export type UseCoachAudioResult = {
  playBlocked: boolean
  isPlaying: boolean
  replay: () => void
}

export function useCoachAudio(
  quelle: string | undefined,
  audioRef: RefObject<HTMLAudioElement | null>,
  enabled = true,
): UseCoachAudioResult {
  const [playBlocked, setPlayBlocked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playPendingRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (!quelle || !enabled) {
      return
    }

    const el = audioRef.current
    if (!el) {
      return
    }

    setPlayBlocked(false)
    setIsPlaying(false)
    el.src = quelle

    const playPromise = el.play()
    if (playPromise) {
      playPendingRef.current = playPromise
      playPromise
        .then(() => {
          playPendingRef.current = null
          setIsPlaying(true)
        })
        .catch((err: DOMException) => {
          playPendingRef.current = null
          if (err.name !== 'AbortError') {
            setPlayBlocked(true)
          }
        })
    }

    return () => {
      const pending = playPendingRef.current
      if (pending) {
        pending.catch(() => {
          /* AbortError beim Unmount ignorieren */
        })
      }
      el.pause()
      el.removeAttribute('src')
      el.load()
      playPendingRef.current = null
    }
  }, [quelle, audioRef, enabled])

  const replay = useCallback(() => {
    const el = audioRef.current
    if (!el || !quelle) {
      return
    }
    if (!el.src) {
      el.src = quelle
    }
    void el
      .play()
      .then(() => {
        setPlayBlocked(false)
        setIsPlaying(true)
      })
      .catch(() => {
        setPlayBlocked(true)
      })
  }, [quelle, audioRef])

  return { playBlocked, isPlaying, replay }
}
