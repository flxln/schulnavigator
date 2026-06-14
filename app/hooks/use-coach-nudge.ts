'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntryMode } from '@/lib/access-tokens'
import {
  markCoachSeen,
  markCoachSuperseded,
  readCoachSeenState,
} from '@/lib/coach-seen'
import {
  resolveHubCoachMessage,
  resolveRoomCoachMessage,
} from '@/lib/coach-triggers'
import type { CoachMessage } from '@/lib/types'

type UseCoachNudgeBase = {
  mode: EntryMode
  blocked?: boolean
  onDismiss?: (message: CoachMessage) => void
}

type UseCoachNudgeHub = UseCoachNudgeBase & {
  surface: 'hub'
  visitedCount: number
  totalStations: number
  isHydrated: boolean
}

type UseCoachNudgeRoom = UseCoachNudgeBase & {
  surface: 'room'
  slug: string
  isHydrated?: boolean
}

export type UseCoachNudgeOptions = UseCoachNudgeHub | UseCoachNudgeRoom

export function useCoachNudge(options: UseCoachNudgeOptions) {
  const [activeMessage, setActiveMessage] = useState<CoachMessage | null>(null)
  const [evaluated, setEvaluated] = useState(false)
  const sessionShownRef = useRef(new Set<string>())

  const tryShow = useCallback(() => {
    const hydrated =
      options.surface === 'hub'
        ? options.isHydrated
        : (options.isHydrated ?? true)

    if (!hydrated || options.blocked) {
      setEvaluated(hydrated)
      return
    }

    const state = readCoachSeenState(options.mode)
    const resolved =
      options.surface === 'hub'
        ? resolveHubCoachMessage(
            options.visitedCount,
            options.totalStations,
            options.mode,
            state,
          )
        : resolveRoomCoachMessage(options.slug, options.mode, state)

    setEvaluated(true)

    if (!resolved) {
      return
    }

    const { message, supersededIds } = resolved
    if (sessionShownRef.current.has(message.id)) {
      return
    }

    sessionShownRef.current.add(message.id)
    markCoachSeen(message.id, options.mode)
    if (supersededIds.length > 0) {
      markCoachSuperseded(supersededIds, options.mode)
    }
    setActiveMessage(message)
  }, [options])

  useEffect(() => {
    if (activeMessage !== null) {
      return
    }
    tryShow()
  }, [activeMessage, tryShow])

  const dismiss = useCallback(() => {
    if (!activeMessage) {
      return
    }
    const message = activeMessage
    setActiveMessage(null)
    options.onDismiss?.(message)
  }, [activeMessage, options])

  return {
    activeMessage,
    evaluated,
    dismiss,
    coachOverlayOpen: activeMessage !== null,
  }
}
