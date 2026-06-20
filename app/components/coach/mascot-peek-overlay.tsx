'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Volume2, X } from 'lucide-react'
import { resolveCoachLayout } from '@/lib/coach-layout'
import { useCoachAudio } from '@/hooks/use-coach-audio'
import type { CoachMessage, CoachPlacement } from '@/lib/types'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'

const MASCOT_SRC = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
} as const

type MascotPeekOverlayProps = {
  message: CoachMessage
  accent?: string
  onDismiss: () => void
}

function tailForPlacement(placement: CoachPlacement): 'left' | 'right' | 'center' {
  if (placement === 'left') {
    return 'right'
  }
  if (placement === 'right') {
    return 'left'
  }
  return 'center'
}

function MascotFigure({
  mascot,
  side,
  style,
  imgStyle,
}: {
  mascot: 'frieda' | 'otto'
  side: 'left' | 'right' | 'bottom'
  style?: CSSProperties
  imgStyle?: CSSProperties
}) {
  const modifier =
    side === 'bottom'
      ? 'sn-coach-peek__figure--bottom'
      : side === 'left'
        ? 'sn-coach-peek__figure--left'
        : 'sn-coach-peek__figure--right'

  return (
    <div className={`sn-coach-peek__figure ${modifier}`} style={style}>
      <Image
        src={MASCOT_SRC[mascot]}
        alt=""
        width={280}
        height={280}
        className="sn-coach-peek__img"
        style={imgStyle}
        priority
      />
    </div>
  )
}

export function MascotPeekOverlay({
  message,
  accent = GS39_BRAND_HEX.navy,
  onDismiss,
}: MascotPeekOverlayProps) {
  const tail = tailForPlacement(message.placement)
  const [portalReady, setPortalReady] = useState(false)
  const resolvedLayout = useMemo(() => resolveCoachLayout(message), [message])
  const audioRef = useRef<HTMLAudioElement>(null)
  const { playBlocked, isPlaying, replay } = useCoachAudio(
    message.quelle,
    audioRef,
    portalReady,
  )

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onDismiss])

  const handleBackdropClick = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  const isDuo = message.mascot === 'duo' && message.placement === 'duo-split'

  const bubbleStyle: CSSProperties = {
    ...resolvedLayout.bubbleStyle,
    borderColor: `${accent}33`,
  }

  const overlay = (
    <div
      className="sn-coach-peek-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-peek-text"
    >
      <button
        type="button"
        className="sn-coach-peek-layer__backdrop"
        aria-label="Hinweis schließen"
        onClick={handleBackdropClick}
      />
      <div className="sn-coach-peek-layer__column sn-page-container">
        <div
          className={`sn-coach-peek sn-coach-peek--${message.placement}`}
        >
          <button
            type="button"
            className="sn-coach-peek__close"
            aria-label="Schließen"
            onClick={onDismiss}
          >
            <X size={22} aria-hidden />
          </button>

          {message.quelle ? (
            <>
              <audio ref={audioRef} preload="auto" className="sr-only" />
              {playBlocked ? (
                <button
                  type="button"
                  className="sn-coach-peek__replay"
                  aria-label="Audio abspielen"
                  onClick={replay}
                >
                  <Volume2 size={20} aria-hidden />
                </button>
              ) : isPlaying ? (
                <span className="sn-coach-peek__audio-active" aria-hidden>
                  <Volume2 size={18} />
                </span>
              ) : null}
            </>
          ) : null}

          {isDuo ? (
            <div
              className="sn-coach-peek__duo-row"
              style={resolvedLayout.duoRowStyle}
            >
              <MascotFigure
                mascot="frieda"
                side="left"
                style={resolvedLayout.figureStyle}
                imgStyle={resolvedLayout.imgStyle}
              />
              <MascotFigure
                mascot="otto"
                side="right"
                style={resolvedLayout.figureStyle}
                imgStyle={resolvedLayout.imgStyle}
              />
            </div>
          ) : message.placement === 'bottom' ? (
            <MascotFigure
              mascot={message.mascot === 'otto' ? 'otto' : 'frieda'}
              side="bottom"
              style={resolvedLayout.figureStyle}
              imgStyle={resolvedLayout.imgStyle}
            />
          ) : message.placement === 'left' || message.placement === 'right' ? (
            <MascotFigure
              mascot={message.mascot === 'otto' ? 'otto' : 'frieda'}
              side={message.placement}
              style={resolvedLayout.figureStyle}
              imgStyle={resolvedLayout.imgStyle}
            />
          ) : null}

          <p
            id="coach-peek-text"
            className={`sn-dialog-bubble sn-dialog-bubble--tail-${tail} sn-coach-peek__bubble`}
            style={bubbleStyle}
          >
            {message.text}
          </p>
        </div>
      </div>
    </div>
  )

  if (!portalReady) {
    return null
  }

  return createPortal(overlay, document.body)
}
