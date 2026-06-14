import { COACH_MESSAGES } from '@/lib/coach-messages'
import { isCoachSeen } from '@/lib/coach-seen'
import type { EntryMode } from '@/lib/access-tokens'
import type { CoachMessage, CoachSeenState } from '@/lib/types'

export type CoachResolveResult = {
  message: CoachMessage
  supersededIds: readonly string[]
}

function messageMatchesMode(message: CoachMessage, mode: EntryMode): boolean {
  if (!message.modes || message.modes.length === 0) {
    return true
  }
  return message.modes.includes(mode)
}

function hubMilestoneMessages(mode: EntryMode): CoachMessage[] {
  return COACH_MESSAGES.filter(
    (m) => m.trigger === 'hub-milestone' && messageMatchesMode(m, mode),
  )
}

function hubCompleteMessage(mode: EntryMode): CoachMessage | undefined {
  return COACH_MESSAGES.find(
    (m) => m.trigger === 'hub-complete' && messageMatchesMode(m, mode),
  )
}

function collectSupersededHubMilestones(
  winner: CoachMessage,
  mode: EntryMode,
  state: CoachSeenState,
): string[] {
  const winnerMilestone =
    winner.trigger === 'hub-complete'
      ? Number.POSITIVE_INFINITY
      : (winner.milestone ?? -1)

  return hubMilestoneMessages(mode)
    .filter((m) => {
      const milestone = m.milestone ?? -1
      if (milestone >= winnerMilestone) {
        return false
      }
      return !isCoachSeen(m.id, state)
    })
    .map((m) => m.id)
}

export function resolveHubCoachMessage(
  visitedCount: number,
  totalStations: number,
  mode: EntryMode,
  state: CoachSeenState,
): CoachResolveResult | null {
  if (totalStations <= 0) {
    return null
  }

  if (visitedCount >= totalStations) {
    const complete = hubCompleteMessage(mode)
    if (!complete || isCoachSeen(complete.id, state)) {
      return null
    }
    const supersededIds = hubMilestoneMessages(mode)
      .filter((m) => !isCoachSeen(m.id, state))
      .map((m) => m.id)
    return { message: complete, supersededIds }
  }

  const candidates = hubMilestoneMessages(mode)
    .filter((m) => {
      const milestone = m.milestone ?? -1
      return milestone <= visitedCount && !isCoachSeen(m.id, state)
    })
    .sort((a, b) => (b.milestone ?? -1) - (a.milestone ?? -1))

  const winner = candidates[0]
  if (!winner) {
    return null
  }

  const supersededIds = collectSupersededHubMilestones(winner, mode, state)
  return { message: winner, supersededIds }
}

export function resolveRoomCoachMessage(
  slug: string,
  mode: EntryMode,
  state: CoachSeenState,
): CoachResolveResult | null {
  const message = COACH_MESSAGES.find(
    (m) =>
      m.trigger === 'room-first' &&
      m.slug === slug &&
      messageMatchesMode(m, mode),
  )
  if (!message || isCoachSeen(message.id, state)) {
    return null
  }
  return { message, supersededIds: [] }
}

export function isHubCompleteCoachId(id: string): boolean {
  const message = COACH_MESSAGES.find((m) => m.id === id)
  return message?.trigger === 'hub-complete'
}
