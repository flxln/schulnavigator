'use client'

import type { BubbleLayoutPx } from '@/lib/dialog-bubble-layout'

type DialogEmbeddedBubbleProps = {
  text: string
  tail: 'left' | 'right' | 'center'
  accent: string
  visible: boolean
  layoutPx?: Pick<BubbleLayoutPx, 'topPx' | 'maxWidthPx' | 'fontSizePx'> | null
  offsetX?: number
}

const LEGACY_TOP =
  'max(3rem, calc(env(safe-area-inset-top) + 2.5rem))' as const

export function DialogEmbeddedBubble({
  text,
  tail,
  accent,
  visible,
  layoutPx,
  offsetX = 0,
}: DialogEmbeddedBubbleProps) {
  if (!visible || !text) {
    return null
  }

  const usePxLayout = layoutPx != null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[20] flex flex-col items-center gap-2 px-3"
      style={{
        top: usePxLayout
          ? `max(${layoutPx.topPx}px, calc(env(safe-area-inset-top) + 2.5rem))`
          : LEGACY_TOP,
      }}
      role="status"
      aria-live="polite"
    >
      <p
        className={
          usePxLayout
            ? `sn-dialog-bubble sn-dialog-bubble--tail-${tail} rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center leading-relaxed text-fg-1 shadow-gs39-lg`
            : `sn-dialog-bubble sn-dialog-bubble--tail-${tail} max-w-md rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center text-[15px] leading-relaxed text-fg-1 shadow-gs39-lg`
        }
        style={{
          borderColor: `${accent}33`,
          ...(usePxLayout
            ? {
                maxWidth: layoutPx.maxWidthPx,
                fontSize: layoutPx.fontSizePx,
              }
            : {}),
          transform: `translateX(${offsetX}px) translateZ(0)`,
          WebkitTransform: `translateX(${offsetX}px) translateZ(0)`,
        }}
      >
        {text}
      </p>
    </div>
  )
}
