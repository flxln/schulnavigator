'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    if (!open) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

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
        className="fixed inset-x-0 bottom-0 z-[40] max-h-[85vh] overflow-y-auto rounded-t-[var(--r-lg)] border border-border-1 bg-bg-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-gs39-lg transition-transform duration-[var(--t-base)] ease-[var(--ease-out)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="station-media-panel-title"
      >
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h2
              id="station-media-panel-title"
              className="text-lg font-semibold text-fg-1"
            >
              {medium.untertitel ?? 'Medium'}
            </h2>
            <button
              type="button"
              className="min-h-11 min-w-11 shrink-0 rounded-[var(--r-sm)] text-2xl leading-none text-fg-2 hover:bg-bg-3 hover:text-fg-1"
              onClick={onClose}
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
          <MediaPlayerByTyp medium={medium} />
        </div>
      </div>
    </>
  )
}
