'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dialog, DialogRolle } from '@/lib/types'
import {
  dialogBubbleText,
  resolveDialogTail,
  segmentHasAudio,
} from '@/lib/dialog-display'

/**
 * Dialog-Playlist (ein <audio>) mit UI-State für eingebettete Sprechblase.
 * startFromUserGesture() muss synchron im Tap-/Click-Handler laufen (iOS).
 */
export function useDialogAudioPlaylist(dialog: Dialog | undefined) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)
  const indexRef = useRef(0)
  const dialogRef = useRef(dialog)
  dialogRef.current = dialog

  const [segmentIndex, setSegmentIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const preloadNext = useCallback((nextIndex: number) => {
    const d = dialogRef.current
    const next = d?.segmente[nextIndex]
    if (!next || !segmentHasAudio(next)) {
      return
    }
    if (!preloadRef.current) {
      preloadRef.current = new Audio()
    }
    preloadRef.current.preload = 'auto'
    preloadRef.current.src = next.quelle!
    preloadRef.current.load()
  }, [])

  const finishDialog = useCallback(() => {
    setPlaying(false)
    setSegmentIndex(null)
    indexRef.current = 0
  }, [])

  const stopDialog = useCallback(() => {
    const el = audioRef.current
    if (el) {
      el.pause()
    }
    finishDialog()
  }, [finishDialog])

  const playSegmentSync = useCallback(
    (segIndex: number) => {
      const d = dialogRef.current
      const seg = d?.segmente[segIndex]
      const el = audioRef.current
      if (!seg || !el) {
        return
      }
      indexRef.current = segIndex
      setSegmentIndex(segIndex)

      if (!segmentHasAudio(seg)) {
        setPlaying(false)
        return
      }

      setPlaying(true)
      el.src = seg.quelle!
      preloadNext(segIndex + 1)
      void el.play().catch(() => {
        /* Fehler → nächstes Segment */
      })
    },
    [preloadNext],
  )

  const advance = useCallback(() => {
    const d = dialogRef.current
    if (!d) {
      return
    }
    const next = indexRef.current + 1
    if (next >= d.segmente.length) {
      finishDialog()
      return
    }
    playSegmentSync(next)
  }, [finishDialog, playSegmentSync])

  const advanceRef = useRef(advance)
  advanceRef.current = advance

  const advanceFromUserGesture = useCallback(() => {
    advanceRef.current()
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) {
      return
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      advanceRef.current()
    }
    const onError = () => advanceRef.current()
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
      el.pause()
    }
  }, [])

  const startFromUserGesture = useCallback(() => {
    if (segmentIndex !== null) {
      return
    }
    const d = dialogRef.current
    if (!d || d.segmente.length === 0) {
      return
    }
    playSegmentSync(0)
  }, [playSegmentSync, segmentIndex])

  const segment =
    dialog && segmentIndex !== null
      ? dialog.segmente[segmentIndex]
      : undefined

  const activeRolle: DialogRolle | null = segment?.rolle ?? null
  const displayText =
    dialog && segment ? dialogBubbleText(segment, dialog) : ''
  const tail = segment ? resolveDialogTail(segment) : 'center'
  const dialogUiActive = segmentIndex !== null
  const currentSegmentIsTextOnly = segment ? !segmentHasAudio(segment) : false

  const speakingRolle: DialogRolle | null = dialogUiActive ? activeRolle : null

  return {
    audioRef,
    startFromUserGesture,
    stopDialog,
    advanceFromUserGesture,
    playing,
    segmentIndex,
    dialogUiActive,
    speakingRolle,
    displayText,
    tail,
    currentSegmentIsTextOnly,
  }
}
