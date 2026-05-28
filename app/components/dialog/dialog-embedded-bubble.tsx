'use client'

type DialogEmbeddedBubbleProps = {
  text: string
  tail: 'left' | 'right' | 'center'
  accent: string
  visible: boolean
  offsetX?: number
}

export function DialogEmbeddedBubble({
  text,
  tail,
  accent,
  visible,
  offsetX = 0,
}: DialogEmbeddedBubbleProps) {
  if (!visible || !text) {
    return null
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[20] flex flex-col items-center gap-2 px-3"
      style={{ top: 'max(3rem, calc(env(safe-area-inset-top) + 2.5rem))' }}
      role="status"
      aria-live="polite"
    >
      <p
        className={`sn-dialog-bubble sn-dialog-bubble--tail-${tail} max-w-md rounded-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 py-3 text-center text-[15px] leading-relaxed text-fg-1 shadow-gs39-lg`}
        style={{
          borderColor: `${accent}33`,
          transform: `translateX(${offsetX}px) translateZ(0)`,
          WebkitTransform: `translateX(${offsetX}px) translateZ(0)`,
        }}
      >
        {text}
      </p>
    </div>
  )
}
