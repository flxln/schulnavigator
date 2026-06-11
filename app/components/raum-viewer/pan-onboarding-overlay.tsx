'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'
const VISIBLE_MS = 3000
const FADE_MS = 400

type Phase = 'idle' | 'visible' | 'fading' | 'done'

export function PanOnboardingOverlay({ skip = false }: { skip?: boolean }) {
  const [phase, setPhase] = useState<Phase>('idle')
  // startedRef verhindert, dass ein skip-Flip (false→true→false, iOS-Watchdog)
  // die Anzeige ein zweites Mal triggert.
  const startedRef = useRef(false)
  const t1Ref = useRef<number | undefined>(undefined)
  const t2Ref = useRef<number | undefined>(undefined)

  // Startet die Anzeige genau einmal beim ersten skip=false-Moment.
  // Die Cleanup dieses Effects löscht die Timer bewusst NICHT —
  // ein späterer skip-Wechsel soll die laufende Anzeige nicht abreißen.
  useEffect(() => {
    if (skip || startedRef.current) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }
    startedRef.current = true
    setPhase('visible')
    t1Ref.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // noop — kein localStorage (z. B. private mode) ist kein Fehler
      }
      setPhase('fading')
    }, VISIBLE_MS)
    t2Ref.current = window.setTimeout(() => setPhase('done'), VISIBLE_MS + FADE_MS)
  }, [skip])

  // Timer-Cleanup nur beim Unmount.
  useEffect(() => {
    return () => {
      clearTimeout(t1Ref.current)
      clearTimeout(t2Ref.current)
    }
  }, [])

  if (phase === 'idle' || phase === 'done') return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2 rounded-[var(--r-lg)] bg-black/55 px-6 py-4">
        <svg
          width="56"
          height="20"
          viewBox="0 0 56 20"
          fill="none"
          aria-hidden="true"
        >
          <polyline
            points="8,4 2,10 8,16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="28"
            cy="10"
            r="4"
            fill="white"
            style={{ animation: 'sn-swipe-hint 1.2s ease-in-out 0.3s infinite' }}
          />
          <polyline
            points="48,4 54,10 48,16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-center text-sm font-semibold text-fg-on-dark">
          Links oder rechts wischen
        </p>
      </div>
    </div>
  )
}
