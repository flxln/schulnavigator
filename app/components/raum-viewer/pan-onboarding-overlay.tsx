'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'
const VISIBLE_MS = 3000
const FADE_MS = 400
const TOTAL_MS = VISIBLE_MS + FADE_MS

type Phase = 'idle' | 'visible' | 'done'

export function PanOnboardingOverlay({
  skip = false,
  mode = 'flat',
}: {
  skip?: boolean
  /** 'sphere' zeigt „Drehe dich um" statt „Links oder rechts wischen". */
  mode?: 'flat' | 'sphere'
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [opacity, setOpacity] = useState(1)
  const dismissedRef = useRef(false)
  // startedRef verhindert, dass ein skip-Flip (false→true→false, iOS-Watchdog)
  // die Anzeige ein zweites Mal triggert.
  const startedRef = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setPhase('done')
  }, [])

  // Startet die Anzeige genau einmal beim ersten skip=false-Moment.
  useEffect(() => {
    if (skip || startedRef.current) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }
    startedRef.current = true
    dismissedRef.current = false
    setOpacity(1)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // noop — kein localStorage (z. B. private mode) ist kein Fehler
    }
    setPhase('visible')
  }, [skip])

  // Ausblenden per rAF + performance.now() — iOS-sicher (kein setTimeout, kein animationend).
  useEffect(() => {
    if (phase !== 'visible') return

    const t0 = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - t0
      if (elapsed >= TOTAL_MS) {
        dismiss()
        return
      }
      if (elapsed > VISIBLE_MS) {
        setOpacity(1 - (elapsed - VISIBLE_MS) / FADE_MS)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - t0
      if (elapsed >= TOTAL_MS) {
        dismiss()
      } else if (elapsed > VISIBLE_MS) {
        setOpacity(1 - (elapsed - VISIBLE_MS) / FADE_MS)
      }
    }, 250)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(interval)
    }
  }, [phase, dismiss])

  if (phase === 'idle' || phase === 'done') return null

  return (
    <div
      data-testid="pan-onboarding-overlay"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2 rounded-[var(--r-lg)] bg-black/55 px-6 py-4">
        {mode === 'sphere' ? (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        ) : (
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
        )}
        <p className="text-center text-sm font-semibold text-fg-on-dark">
          {mode === 'sphere' ? 'Drehe dich um' : 'Links oder rechts wischen'}
        </p>
      </div>
    </div>
  )
}
