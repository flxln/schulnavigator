import { HEFT_DEV_TOKEN } from '@/lib/access-tokens'

/** Heft-Token für DEV_UNLOCK_ALL — alle Hub-Fenster klickbar (ADR-009). */
export const DEV_UNLOCK_HEFT_TOKEN = HEFT_DEV_TOKEN

export function isDevUnlockAll(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_UNLOCK_ALL === 'true'
  )
}
