'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dialog, DialogRolle, DialogSegment } from '@/lib/types'
import { segmentHasAudio } from '@/lib/dialog-display'
import { Gs39Button } from '@/components/ui/gs39-button'

export type DialogPlayerProps = {
  dialog: Dialog
  accent: string
  onClose: () => void
}

function bubbleText(
  segment: DialogSegment,
  dialog: Dialog,
): string {
  if (segment.gruppe && dialog.gruppen) {
    const g = dialog.gruppen.find((x) => x.id === segment.gruppe)
    if (g) {
      return g.text
    }
  }
  return segment.text
}

function tailSide(rolle: DialogRolle): 'left' | 'right' | 'center' {
  if (rolle === 'frieda') {
    return 'left'
  }
  if (rolle === 'otto') {
    return 'right'
  }
  return 'center'
}

export function DialogPlayer({ dialog, accent, onClose }: DialogPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [finished, setFinished] = useState(false)

  const segment = dialog.segmente[index]
  const total = dialog.segmente.length

  const activeRolle: DialogRolle | null = started ? segment?.rolle ?? null : null
  const displayText = segment ? bubbleText(segment, dialog) : ''

  const preloadNext = useCallback(
    (nextIndex: number) => {
      const next = dialog.segmente[nextIndex]
      if (!next || !segmentHasAudio(next)) {
        return
      }
      if (!preloadRef.current) {
        preloadRef.current = new Audio()
      }
      preloadRef.current.preload = 'auto'
      preloadRef.current.src = next.quelle!
      preloadRef.current.load()
    },
    [dialog.segmente],
  )

  const playSegment = useCallback(
    async (segIndex: number) => {
      const seg = dialog.segmente[segIndex]
      const el = audioRef.current
      if (!seg || !el) {
        return
      }
      setLoadError(false)
      setIndex(segIndex)
      if (!segmentHasAudio(seg)) {
        setPlaying(false)
        return
      }
      el.src = seg.quelle!
      preloadNext(segIndex + 1)
      try {
        await el.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
        setLoadError(true)
      }
    },
    [dialog.segmente, preloadNext],
  )

  const advance = useCallback(() => {
    const next = index + 1
    if (next >= total) {
      setPlaying(false)
      setFinished(true)
      return
    }
    void playSegment(next)
  }, [index, total, playSegment])

  // Ref hält immer die aktuelle advance-Funktion — verhindert Stale-Closure
  // im Audio-Event-Listener ohne den Effect bei jedem Index-Wechsel neu zu mounten.
  const advanceRef = useRef(advance)
  advanceRef.current = advance

  const handleStart = useCallback(() => {
    setStarted(true)
    setFinished(false)
    setIndex(0)
    void playSegment(0)
  }, [playSegment, dialog.segmente.length])

  const handleReplay = useCallback(() => {
    setFinished(false)
    setIndex(0)
    void playSegment(0)
  }, [playSegment])

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
    const onError = () => {
      setPlaying(false)
      setLoadError(true)
      advanceRef.current()
    }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      preloadRef.current = null
    }
  }, [])

  const friedaActive =
    activeRolle === 'frieda' || activeRolle === 'beide'
  const ottoActive = activeRolle === 'otto' || activeRolle === 'beide'

  const tail = useMemo(
    () => (activeRolle ? tailSide(activeRolle) : 'center'),
    [activeRolle],
  )

  const currentIsTextOnly = segment ? !segmentHasAudio(segment) : false

  return (
    <div
      className="sn-dialog-cutscene fixed inset-0 z-20 flex flex-col bg-bg-dark/75 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Stationen-Dialog"
    >
      <audio ref={audioRef} preload="auto" className="sr-only" />

      <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="t-eyebrow text-[11px] text-fg-on-dark/80">
          Dialog · {started && !finished ? `${index + 1} / ${total}` : total}{' '}
          Abschnitte
        </p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 min-w-11 rounded-full bg-white/15 text-lg leading-none text-fg-on-dark"
          aria-label="Dialog schließen"
        >
          ×
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-end gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div
          className={`sn-dialog-bubble sn-dialog-bubble--tail-${tail} w-full max-w-md rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center text-[15px] leading-relaxed text-fg-1 shadow-gs39-lg`}
          style={{ borderColor: `${accent}33` }}
        >
          {started ? displayText : 'Tippe auf Start — der Dialog läuft mit Untertiteln.'}
        </div>

        {loadError ? (
          <p className="text-center text-sm text-brand-sun" role="status">
            Ein Audio-Abschnitt konnte nicht geladen werden — es geht weiter.
          </p>
        ) : null}

        <div className="flex w-full max-w-lg items-end justify-between gap-3 px-2">
          <MascotFigure
            name="frieda"
            active={friedaActive}
            playing={playing && friedaActive}
          />
          <MascotFigure
            name="otto"
            active={ottoActive}
            playing={playing && ottoActive}
          />
        </div>

        <div className="flex w-full max-w-md flex-col gap-2">
          {!started ? (
            <Gs39Button type="button" variant="primary" block onClick={handleStart}>
              ▶ Dialog starten
            </Gs39Button>
          ) : null}
          {finished ? (
            <Gs39Button type="button" variant="outline" block onClick={handleReplay}>
              Nochmal anhören
            </Gs39Button>
          ) : null}
          {started && !finished && currentIsTextOnly ? (
            <Gs39Button type="button" variant="primary" block onClick={advance}>
              Weiter
            </Gs39Button>
          ) : null}
          {started && !finished ? (
            <Gs39Button
              type="button"
              variant="outline"
              block
              onClick={() => {
                audioRef.current?.pause()
                onClose()
              }}
            >
              Dialog beenden
            </Gs39Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type MascotFigureProps = {
  name: 'frieda' | 'otto'
  active: boolean
  playing: boolean
}

function MascotFigure({ name, active, playing }: MascotFigureProps) {
  const label = name === 'frieda' ? 'Frieda' : 'Otto'
  return (
    <div
      className={`sn-dialog-mascot flex flex-col items-center gap-1 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-45'}`}
      aria-hidden={!active}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Alpha-PNG */}
      <img
        src={`/brand/mascots/${name}.png`}
        alt=""
        width={120}
        height={120}
        className={`sn-dialog-mascot__img h-[110px] w-[110px] object-contain sm:h-[130px] sm:w-[130px] ${playing ? 'sn-dialog-mascot__img--speaking' : ''} ${active ? 'sn-dialog-mascot__img--active' : 'scale-90'}`}
      />
      <span className="font-display text-sm tracking-wide text-fg-on-dark">{label}</span>
    </div>
  )
}
