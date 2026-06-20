import { join } from 'node:path'
import { existsSync, unlinkSync } from 'node:fs'
import { getStationsPaths } from '@/lib/mpz-content-io'

export const COACH_MESSAGE_ID_RE = /^[a-z0-9][a-z0-9-]*$/

export function coachApiQuelle(messageId: string): string {
  return `/api/coach/${messageId}`
}

export function coachAudioFsPath(appRoot: string, messageId: string): string {
  return join(appRoot, 'content', 'coach-audio', `${messageId}.wav`)
}

/** Laufzeit-Pfad — immer über `getStationsPaths().appRoot`, nicht `process.cwd()`. */
export function coachAudioFilePath(messageId: string): string {
  return coachAudioFsPath(getStationsPaths().appRoot, messageId)
}

export function parseCoachApiPath(pathname: string): { messageId: string } | null {
  const match = pathname.match(/^\/api\/coach\/([a-z0-9][a-z0-9-]*)$/)
  if (!match?.[1] || !COACH_MESSAGE_ID_RE.test(match[1])) {
    return null
  }
  return { messageId: match[1] }
}

export function quelleMatchesCoachConvention(
  quelle: string,
  messageId: string,
): boolean {
  return quelle === coachApiQuelle(messageId)
}

/** Route-Handler: WAV löschen, Fehler nur loggen (JSON ist Source of Truth). */
export function tryDeleteCoachWav(messageId: string): void {
  try {
    const path = coachAudioFilePath(messageId)
    if (existsSync(path)) {
      unlinkSync(path)
    }
  } catch (err) {
    console.error(`Coach-WAV löschen fehlgeschlagen (${messageId}):`, err)
  }
}
