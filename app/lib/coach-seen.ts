import type { EntryMode } from '@/lib/access-tokens'
import type { CoachSeenState } from '@/lib/types'

export const COACH_SEEN_STORAGE_KEY_FEST = 'sn_coach_seen_fest'
export const COACH_SEEN_STORAGE_KEY_HEFT = 'sn_coach_seen_heft'

export const COACH_SEEN_CHANGED_EVENT = 'sn:coach-seen'

const STORAGE_KEYS: Record<EntryMode, string> = {
  fest: COACH_SEEN_STORAGE_KEY_FEST,
  heft: COACH_SEEN_STORAGE_KEY_HEFT,
}

export const EMPTY_COACH_SEEN_STATE: CoachSeenState = {
  version: 1,
  seen: [],
  suppressed: [],
}

export function coachStorageKey(mode: EntryMode): string {
  return STORAGE_KEYS[mode]
}

export function parseCoachSeenState(raw: string | null): CoachSeenState {
  if (raw === null || raw === '') {
    return { ...EMPTY_COACH_SEEN_STATE, seen: [], suppressed: [] }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ...EMPTY_COACH_SEEN_STATE, seen: [], suppressed: [] }
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ...EMPTY_COACH_SEEN_STATE, seen: [], suppressed: [] }
  }
  const obj = parsed as Record<string, unknown>
  if (obj.version !== 1) {
    return { ...EMPTY_COACH_SEEN_STATE, seen: [], suppressed: [] }
  }
  const seen = normalizeIdList(obj.seen)
  const suppressed = normalizeIdList(obj.suppressed)
  return { version: 1, seen, suppressed }
}

function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  const out: string[] = []
  const dedupe = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string' || dedupe.has(item)) {
      continue
    }
    dedupe.add(item)
    out.push(item)
  }
  return out
}

export function isCoachSeen(id: string, state: CoachSeenState): boolean {
  return state.seen.includes(id) || state.suppressed.includes(id)
}

function readRawFromStorage(mode: EntryMode): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  try {
    return window.localStorage.getItem(coachStorageKey(mode))
  } catch {
    console.warn(
      '[schulnavigator] coach seen: localStorage read failed — coach state unavailable',
    )
    return null
  }
}

function writeRawToStorage(mode: EntryMode, serialized: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }
  try {
    window.localStorage.setItem(coachStorageKey(mode), serialized)
    return true
  } catch {
    console.warn(
      '[schulnavigator] coach seen: localStorage write failed — coach state not saved',
    )
    return false
  }
}

export function readCoachSeenState(mode: EntryMode): CoachSeenState {
  return parseCoachSeenState(readRawFromStorage(mode))
}

export function writeCoachSeenState(
  mode: EntryMode,
  state: CoachSeenState,
): boolean {
  return writeRawToStorage(mode, JSON.stringify(state))
}

export function dispatchCoachSeenChanged(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(COACH_SEEN_CHANGED_EVENT))
}

function mergeUniqueIds(
  current: readonly string[],
  additions: readonly string[],
): string[] {
  const out = [...current]
  const seen = new Set(current)
  for (const id of additions) {
    if (seen.has(id)) {
      continue
    }
    seen.add(id)
    out.push(id)
  }
  return out
}

export function markCoachSeen(id: string, mode: EntryMode): CoachSeenState {
  const current = readCoachSeenState(mode)
  if (isCoachSeen(id, current)) {
    return current
  }
  const next: CoachSeenState = {
    version: 1,
    seen: mergeUniqueIds(current.seen, [id]),
    suppressed: [...current.suppressed],
  }
  if (writeCoachSeenState(mode, next)) {
    dispatchCoachSeenChanged()
  }
  return next
}

export function markCoachSuperseded(
  ids: readonly string[],
  mode: EntryMode,
): CoachSeenState {
  const current = readCoachSeenState(mode)
  const toAdd = ids.filter((id) => !isCoachSeen(id, current))
  if (toAdd.length === 0) {
    return current
  }
  const next: CoachSeenState = {
    version: 1,
    seen: [...current.seen],
    suppressed: mergeUniqueIds(current.suppressed, toAdd),
  }
  if (writeCoachSeenState(mode, next)) {
    dispatchCoachSeenChanged()
  }
  return next
}
