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
  const pendingMarkRef = useRef<{
    messageId: string
    supersededIds: readonly string[]
  } | null>(null)

  const blocked = options.blocked ?? false
  const mode = options.mode
  const surface = options.surface
  const isHydrated =
    surface === 'hub' ? options.isHydrated : (options.isHydrated ?? true)
  const visitedCount = surface === 'hub' ? options.visitedCount : 0
  const totalStations = surface === 'hub' ? options.totalStations : 0
  const slug = surface === 'room' ? options.slug : ''

  const tryShow = useCallback(() => {
    if (!isHydrated || blocked) {
      setEvaluated(isHydrated)
      return
    }

    const state = readCoachSeenState(mode)
    const resolved =
      surface === 'hub'
        ? resolveHubCoachMessage(visitedCount, totalStations, mode, state)
        : resolveRoomCoachMessage(slug, mode, state)

    setEvaluated(true)

    if (!resolved) {
      return
    }

    const { message, supersededIds } = resolved
    if (sessionShownRef.current.has(message.id)) {
      return
    }

    sessionShownRef.current.add(message.id)
    pendingMarkRef.current = {
      messageId: message.id,
      supersededIds,
    }
    setActiveMessage(message)
  }, [
    blocked,
    isHydrated,
    mode,
    surface,
    slug,
    totalStations,
    visitedCount,
  ])

  useEffect(() => {
    if (activeMessage !== null) {
      return
    }
    tryShow()
  }, [activeMessage, tryShow])

  useEffect(() => {
    if (!activeMessage || !pendingMarkRef.current) {
      return
    }
    if (pendingMarkRef.current.messageId !== activeMessage.id) {
      return
    }
    markCoachSeen(activeMessage.id, mode)
    if (pendingMarkRef.current.supersededIds.length > 0) {
      markCoachSuperseded(pendingMarkRef.current.supersededIds, mode)
    }
    pendingMarkRef.current = null
  }, [activeMessage, mode])

  useEffect(() => {
    if (!blocked || !activeMessage) {
      return
    }
    if (pendingMarkRef.current?.messageId === activeMessage.id) {
      sessionShownRef.current.delete(activeMessage.id)
      pendingMarkRef.current = null
    }
    setActiveMessage(null)
  }, [blocked, activeMessage])

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
