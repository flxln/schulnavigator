'use client'

import type { BubbleLayoutPx } from '@/lib/dialog-bubble-layout'

type DialogEmbeddedBubbleProps = {
  text: string
  tail: 'left' | 'right' | 'center'
  accent: string
  visible: boolean
  layoutPx?: Pick<BubbleLayoutPx, 'topPx' | 'maxWidthPx' | 'fontSizePx'> | null
  offsetX?: number
  interactive?: boolean
  onAdvance?: () => void
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
  interactive = false,
  onAdvance,
}: DialogEmbeddedBubbleProps) {
  if (!visible || !text) {
    return null
  }

  const usePxLayout = layoutPx != null

  const bubbleClassName = usePxLayout
    ? `sn-dialog-bubble sn-dialog-bubble--tail-${tail} rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center leading-relaxed text-fg-1 shadow-gs39-lg`
    : `sn-dialog-bubble sn-dialog-bubble--tail-${tail} max-w-md md:max-w-lg rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center text-[15px] leading-relaxed text-fg-1 shadow-gs39-lg`

  const bubbleStyle = {
    borderColor: `${accent}33`,
    ...(usePxLayout
      ? {
          maxWidth: layoutPx.maxWidthPx,
          fontSize: layoutPx.fontSizePx,
        }
      : {}),
    transform: `translateX(${offsetX}px) translateZ(0)`,
    WebkitTransform: `translateX(${offsetX}px) translateZ(0)`,
  } as const

  return (
    <div
      className={`absolute inset-x-0 z-[20] flex flex-col items-center gap-2 px-3 md:gap-3 ${interactive ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        top: usePxLayout
          ? `max(${layoutPx.topPx}px, calc(env(safe-area-inset-top) + 2.5rem))`
          : LEGACY_TOP,
      }}
      role={interactive ? 'group' : 'status'}
      aria-live={interactive ? undefined : 'polite'}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onAdvance}
          className={`${bubbleClassName} cursor-pointer text-left transition-opacity hover:opacity-95 active:opacity-90`}
          style={bubbleStyle}
          aria-label="Weiter"
        >
          {text}
          <span className="mt-2 block text-center text-[11px] font-medium text-fg-3">
            Tippen zum Weiter
          </span>
        </button>
      ) : (
        <p className={bubbleClassName} style={bubbleStyle}>
          {text}
        </p>
      )}
    </div>
  )
}
