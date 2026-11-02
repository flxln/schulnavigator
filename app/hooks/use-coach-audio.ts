'use client'

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefCallback,
} from 'react'
import { AUDIO_UNLOCK_EVENT } from '@/lib/audio-autoplay-unlock'

export type UseCoachAudioResult = {
  playBlocked: boolean
  isPlaying: boolean
  replay: () => void
  audioRef: RefCallback<HTMLAudioElement>
}

export function useCoachAudio(
  quelle: string | undefined,
  enabled = true,
): UseCoachAudioResult {
  const [playBlocked, setPlayBlocked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const playPendingRef = useRef<Promise<void> | null>(null)
  const generationRef = useRef(0)

  const audioRef: RefCallback<HTMLAudioElement> = useCallback((el) => {
    setAudioEl(el)
  }, [])

  const attemptPlay = useCallback((el: HTMLAudioElement, source: string) => {
    const generation = ++generationRef.current
    el.src = source
    const playPromise = el.play()
    if (!playPromise) {
      return
    }
    playPendingRef.current = playPromise
    playPromise
      .then(() => {
        if (generationRef.current !== generation) {
          return
        }
        playPendingRef.current = null
        setPlayBlocked(false)
        setIsPlaying(true)
      })
      .catch((err: DOMException) => {
        if (generationRef.current !== generation) {
          return
        }
        playPendingRef.current = null
        if (err.name !== 'AbortError') {
          setPlayBlocked(true)
          setIsPlaying(false)
        }
      })
  }, [])

  useLayoutEffect(() => {
    if (!quelle || !enabled || !audioEl) {
      return
    }

    setPlayBlocked(false)
    setIsPlaying(false)
    attemptPlay(audioEl, quelle)

    const onUnlock = () => {
      setPlayBlocked(false)
      attemptPlay(audioEl, quelle)
    }
    window.addEventListener(AUDIO_UNLOCK_EVENT, onUnlock)

    return () => {
      window.removeEventListener(AUDIO_UNLOCK_EVENT, onUnlock)
      generationRef.current += 1
      const pending = playPendingRef.current
      if (pending) {
        pending.catch(() => {
          /* AbortError beim Unmount ignorieren */
        })
      }
      audioEl.pause()
      audioEl.removeAttribute('src')
      audioEl.load()
      playPendingRef.current = null
    }
  }, [quelle, enabled, audioEl, attemptPlay])

  const replay = useCallback(() => {
    if (!audioEl || !quelle) {
      return
    }
    if (!audioEl.src) {
      audioEl.src = quelle
    }
    attemptPlay(audioEl, quelle)
  }, [quelle, audioEl, attemptPlay])

  return { playBlocked, isPlaying, replay, audioRef }
}
