'use client'

import { useEffect, useRef } from 'react'
import type { Medium } from '@/lib/types'
import { MediaPlayerByTyp } from '@/components/media-player-by-typ'

export type StationMediaPanelProps = {
  open: boolean
  medium: Medium | null
  onClose: () => void
}

export function StationMediaPanel({
  open,
  medium,
  onClose,
}: StationMediaPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || !medium) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[35] bg-bg-dark/30"
        aria-label="Medienfenster schließen"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[40] flex max-h-[85vh] flex-col overflow-hidden rounded-t-[var(--r-lg)] border border-border-1 bg-bg-2 shadow-gs39-lg transition-transform duration-[var(--t-base)] ease-[var(--ease-out)] md:inset-0 md:max-h-none md:items-center md:justify-center md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="station-media-panel-title"
      >
        <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden rounded-t-[var(--r-lg)] bg-bg-2 md:my-[max(1rem,env(safe-area-inset-top))] md:mb-[max(1rem,env(safe-area-inset-bottom))] md:max-h-[85vh] md:max-w-2xl md:flex-none md:rounded-[var(--r-lg)] md:border md:border-border-1 md:shadow-gs39-lg">
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border-1 bg-bg-2 px-4 pb-2 pt-3">
            <h2
              id="station-media-panel-title"
              className="text-lg font-semibold text-fg-1"
            >
              {medium.untertitel ?? 'Medium'}
            </h2>
            <button
              ref={closeRef}
              type="button"
              className="min-h-11 min-w-11 shrink-0 rounded-[var(--r-sm)] text-2xl leading-none text-fg-2 hover:bg-bg-3 hover:text-fg-1"
              onClick={onClose}
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:pb-4">
            {medium.typ === 'video' ? (
              <div className="aspect-video w-full overflow-hidden rounded-[var(--r-sm)] bg-brand-navy">
                <MediaPlayerByTyp medium={medium} />
              </div>
            ) : (
              <MediaPlayerByTyp medium={medium} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
