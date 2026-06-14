import coachData from '@/content/coach-messages.json'
import type { CoachMessage, CoachMessagesFile } from '@/lib/types'

const file = coachData as CoachMessagesFile

export const COACH_MESSAGES: readonly CoachMessage[] = file.messages

export function getCoachMessageById(id: string): CoachMessage | undefined {
  return COACH_MESSAGES.find((m) => m.id === id)
}
