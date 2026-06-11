/** Heft-Token für DEV_UNLOCK_ALL — alle Hub-Fenster klickbar (ADR-009). */
export const DEV_UNLOCK_HEFT_TOKEN = 'heft-2026-27' as const

export function isDevUnlockAll(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_UNLOCK_ALL === 'true'
  )
}
