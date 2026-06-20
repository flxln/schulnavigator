import type { CoachMessage, CoachMessagesFile } from '@/lib/types'
import { validateCoachLayoutFields } from '@/lib/coach-layout'

export const COACH_PLACEMENTS = new Set(['bottom', 'left', 'right', 'duo-split'])
export const COACH_TRIGGERS = new Set(['hub-milestone', 'hub-complete', 'room-first'])
export const COACH_MASCOTS = new Set(['frieda', 'otto', 'duo'])
export const COACH_MODES = new Set(['fest', 'heft'])

export function validateCoachMessagesContent(
  file: CoachMessagesFile,
  stationCount: number,
  stationSlugs: ReadonlySet<string>,
): string[] {
  const errors: string[] = []
  const messages = file.messages

  if (!Array.isArray(messages)) {
    errors.push('coach-messages.json: messages muss ein Array sein')
    return errors
  }

  const ids = new Set<string>()
  let hubCompleteCount = 0
  let maxHubMilestone = -1

  for (const [index, raw] of messages.entries()) {
    const ctx = `messages[${index}]`
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`${ctx}: kein Objekt`)
      continue
    }
    const m = raw as CoachMessage

    if (typeof m.id !== 'string' || m.id.trim() === '') {
      errors.push(`${ctx}: id fehlt`)
    } else if (ids.has(m.id)) {
      errors.push(`${ctx}: doppelte id "${m.id}"`)
    } else {
      ids.add(m.id)
    }

    if (!COACH_TRIGGERS.has(m.trigger)) {
      errors.push(`${ctx}: ungültiger trigger "${m.trigger}"`)
    }

    if (!COACH_MASCOTS.has(m.mascot)) {
      errors.push(`${ctx}: ungültiger mascot "${m.mascot}"`)
    }

    if (!COACH_PLACEMENTS.has(m.placement)) {
      errors.push(`${ctx}: ungültiger placement "${m.placement}"`)
    }

    if (m.mascot === 'duo' && m.placement !== 'duo-split') {
      errors.push(`${ctx}: mascot "duo" erfordert placement "duo-split"`)
    }
    if (m.placement === 'duo-split' && m.mascot !== 'duo') {
      errors.push(`${ctx}: placement "duo-split" erfordert mascot "duo"`)
    }

    if (typeof m.text !== 'string' || m.text.trim() === '') {
      errors.push(`${ctx}: text fehlt`)
    }

    if (m.modes !== undefined) {
      if (!Array.isArray(m.modes) || m.modes.length === 0) {
        errors.push(`${ctx}: modes muss ein nicht-leeres Array sein`)
      } else {
        for (const mode of m.modes) {
          if (!COACH_MODES.has(mode)) {
            errors.push(`${ctx}: ungültiger mode "${mode}"`)
          }
        }
      }
    }

    if (m.trigger === 'hub-milestone') {
      if (typeof m.milestone !== 'number' || !Number.isInteger(m.milestone)) {
        errors.push(`${ctx}: hub-milestone braucht ganzzahliges milestone`)
      } else if (m.milestone < 0 || m.milestone >= stationCount) {
        errors.push(
          `${ctx}: milestone ${m.milestone} außerhalb 0–${stationCount - 1}`,
        )
      } else if (m.milestone > maxHubMilestone) {
        maxHubMilestone = m.milestone
      }
      if (m.slug !== undefined) {
        errors.push(`${ctx}: hub-milestone darf kein slug haben`)
      }
    }

    if (m.trigger === 'hub-complete') {
      hubCompleteCount += 1
      if (m.milestone !== undefined) {
        errors.push(`${ctx}: hub-complete darf kein milestone haben`)
      }
      if (m.slug !== undefined) {
        errors.push(`${ctx}: hub-complete darf kein slug haben`)
      }
    }

    if (m.trigger === 'room-first') {
      if (typeof m.slug !== 'string' || !stationSlugs.has(m.slug)) {
        errors.push(`${ctx}: room-first slug "${m.slug}" unbekannt in stations.json`)
      }
      if (m.milestone !== undefined) {
        errors.push(`${ctx}: room-first darf kein milestone haben`)
      }
    }

    if (m.layout !== undefined) {
      errors.push(...validateCoachLayoutFields(m.layout, ctx))
    }
  }

  if (hubCompleteCount !== 1) {
    errors.push(
      `genau eine hub-complete-Message erwartet, gefunden: ${hubCompleteCount}`,
    )
  }

  if (maxHubMilestone >= stationCount) {
    errors.push(
      `höchste hub-milestone (${maxHubMilestone}) muss < ${stationCount} sein`,
    )
  }

  return errors
}
