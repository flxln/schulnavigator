'use client'

type DialogEmbeddedBubbleProps = {
  text: string
  tail: 'left' | 'right' | 'center'
  accent: string
  visible: boolean
  onEnd?: () => void
}

export function DialogEmbeddedBubble({
  text,
  tail,
  accent,
  visible,
  onEnd,
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
          WebkitTransform: 'translateZ(0)',
        }}
      >
        {text}
      </p>
      {onEnd ? (
        <button
          type="button"
          className="pointer-events-auto min-h-11 rounded-full border border-border-1 bg-bg-2 px-4 text-sm font-medium text-fg-1 shadow-gs39-sm"
          onClick={onEnd}
        >
          Dialog beenden
        </button>
      ) : null}
    </div>
  )
}
