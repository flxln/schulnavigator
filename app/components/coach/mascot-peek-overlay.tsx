'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { CoachMessage, CoachPlacement } from '@/lib/types'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'

const MASCOT_SRC = {
  frieda: '/brand/mascots/frieda.png',
  otto: '/brand/mascots/otto.png',
} as const

function scanAncestorContainingBlocks(el: HTMLElement | null) {
  const hits: Array<{ tag: string; cls: string; transform: string; overflow: string; position: string }> = []
  let node: HTMLElement | null = el?.parentElement ?? null
  while (node && node !== document.body) {
    const cs = getComputedStyle(node)
    const transform = cs.transform
    const filter = cs.filter
    const perspective = cs.perspective
    const willChange = cs.willChange
    if (
      (transform && transform !== 'none') ||
      (filter && filter !== 'none') ||
      (perspective && perspective !== 'none') ||
      willChange.includes('transform')
    ) {
      hits.push({
        tag: node.tagName,
        cls: node.className?.toString?.().slice(0, 80) ?? '',
        transform,
        overflow: cs.overflow,
        position: cs.position,
      })
    }
    node = node.parentElement
  }
  return hits
}

function debugCoachOverlay(layerEl: HTMLElement, placement: string) {
  const cs = getComputedStyle(layerEl)
  const rect = layerEl.getBoundingClientRect()
  const ancestors = scanAncestorContainingBlocks(layerEl)
  const payload = {
    placement,
    portaled: layerEl.parentElement === document.body,
    parentTag: layerEl.parentElement?.tagName ?? null,
    layerPosition: cs.position,
    layerZIndex: cs.zIndex,
    layerRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    viewport: { w: window.innerWidth, h: window.innerHeight },
    offsetParent: layerEl.offsetParent?.tagName ?? null,
    ancestorTransforms: ancestors,
    ua: navigator.userAgent.slice(0, 120),
  }
  // #region agent log
  try {
    sessionStorage.setItem('sn_debug_coach_70672c', JSON.stringify(payload))
  } catch {
    /* ignore */
  }
  fetch('http://127.0.0.1:7812/ingest/450accf7-28ed-44f9-aee9-40c757f74622', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '70672c' },
    body: JSON.stringify({
      sessionId: '70672c',
      runId: 'post-fix',
      location: 'mascot-peek-overlay.tsx:debugCoachOverlay',
      message: 'coach overlay mount metrics',
      data: payload,
      timestamp: Date.now(),
      hypothesisId: 'A-B-C',
    }),
  }).catch(() => {})
  // #endregion
  return payload
}

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
}: {
  mascot: 'frieda' | 'otto'
  side: 'left' | 'right' | 'bottom'
}) {
  const modifier =
    side === 'bottom'
      ? 'sn-coach-peek__figure--bottom'
      : side === 'left'
        ? 'sn-coach-peek__figure--left'
        : 'sn-coach-peek__figure--right'

  return (
    <div className={`sn-coach-peek__figure ${modifier}`}>
      <Image
        src={MASCOT_SRC[mascot]}
        alt=""
        width={280}
        height={280}
        className="sn-coach-peek__img"
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
  const layerRef = useRef<HTMLDivElement>(null)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const el = layerRef.current
    if (!el) return
    const run = () => debugCoachOverlay(el, message.placement)
    run()
    const t = window.requestAnimationFrame(run)
    return () => window.cancelAnimationFrame(t)
  }, [message.placement])

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

  const overlay = (
    <div
      ref={layerRef}
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

        {isDuo ? (
          <div className="sn-coach-peek__duo-row">
            <MascotFigure mascot="frieda" side="left" />
            <MascotFigure mascot="otto" side="right" />
          </div>
        ) : message.placement === 'bottom' ? (
          <MascotFigure
            mascot={message.mascot === 'otto' ? 'otto' : 'frieda'}
            side="bottom"
          />
        ) : message.placement === 'left' || message.placement === 'right' ? (
          <MascotFigure
            mascot={message.mascot === 'otto' ? 'otto' : 'frieda'}
            side={message.placement}
          />
        ) : null}

        <p
          id="coach-peek-text"
          className={`sn-dialog-bubble sn-dialog-bubble--tail-${tail} sn-coach-peek__bubble`}
          style={{ borderColor: `${accent}33` }}
        >
          {message.text}
        </p>
      </div>
    </div>
  )

  if (!portalReady) {
    return null
  }

  return createPortal(overlay, document.body)
}
