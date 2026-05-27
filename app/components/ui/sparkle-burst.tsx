'use client'

import { useEffect, useMemo, type CSSProperties } from 'react'

const SPARKLE_PALETTE = [
  'var(--brand-sun)',
  'var(--brand-red)',
  'var(--brand-blue)',
  'var(--brand-green)',
] as const

type SparkleBurstProps = {
  /** CSS position, e.g. `50%` */
  x?: string
  y?: string
  accent?: string
  onDone?: () => void
  className?: string
}

export function SparkleBurst({
  x = '50%',
  y = '40%',
  accent = 'var(--brand-sun)',
  onDone,
  className = '',
}: SparkleBurstProps) {
  const dots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4
        const dist = 60 + Math.random() * 50
        const palette = [...SPARKLE_PALETTE, accent]
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: palette[i % palette.length] ?? accent,
          size: 5 + Math.random() * 5,
        }
      }),
    [accent],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => onDone?.(), 900)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`sn-sparkle ${className}`.trim()}
      style={{ left: x, top: y }}
      aria-hidden
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="sn-sparkle__dot"
          style={
            {
              background: d.color,
              width: d.size,
              height: d.size,
              '--dx': `${d.dx}px`,
              '--dy': `${d.dy}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
