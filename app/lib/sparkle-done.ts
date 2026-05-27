export const SPARKLE_DONE_STORAGE_KEY = 'sn_sparkle_done'

export function isSparkleDone(): boolean {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(SPARKLE_DONE_STORAGE_KEY) === '1'
}

export function markSparkleDone(): void {
  localStorage.setItem(SPARKLE_DONE_STORAGE_KEY, '1')
}
