'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'schulnav.pan-onboarding.seen'
const VISIBLE_MS = 3000
const FADE_MS = 400

type Phase = 'idle' | 'visible' | 'fading' | 'done'

export function PanOnboardingOverlay({ skip = false }: { skip?: boolean }) {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (skip) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      return
    }
    setPhase('visible')
    const t1 = window.setTimeout(() => setPhase('fading'), VISIBLE_MS)
    const t2 = window.setTimeout(() => setPhase('done'), VISIBLE_MS + FADE_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [skip])

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
