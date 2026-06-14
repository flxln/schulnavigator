'use client'

import type { CoachMessage } from '@/lib/types'
import { MascotPeekOverlay } from '@/components/coach/mascot-peek-overlay'

type CoachNudgeLayerProps = {
  message: CoachMessage | null
  accent?: string
  onDismiss: () => void
}

export function CoachNudgeLayer({
  message,
  accent,
  onDismiss,
}: CoachNudgeLayerProps) {
  if (!message) {
    return null
  }

  return (
    <MascotPeekOverlay
      message={message}
      accent={accent}
      onDismiss={onDismiss}
    />
  )
}
