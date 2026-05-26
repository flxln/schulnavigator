export const VISITED_SLUGS_STORAGE_KEY = 'sn_visited_slugs'

export const VISITED_CHANGED_EVENT = 'sn:visited'

export function parseVisitedSlugs(
  raw: string | null,
  validSlugs: ReadonlySet<string>,
): readonly string[] {
  if (raw === null || raw === '') {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) {
    return []
  }
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of parsed) {
    if (typeof item !== 'string' || !validSlugs.has(item) || seen.has(item)) {
      continue
    }
    seen.add(item)
    out.push(item)
  }
  return out
}

export function addVisitedSlug(
  current: readonly string[],
  slug: string,
  validSlugs: ReadonlySet<string>,
): readonly string[] {
  if (!validSlugs.has(slug)) {
    return current
  }
  if (current.includes(slug)) {
    return current
  }
  return [...current, slug]
}

export function countVisited(
  current: readonly string[],
  validSlugs: ReadonlySet<string>,
): number {
  let n = 0
  for (const slug of current) {
    if (validSlugs.has(slug)) {
      n += 1
    }
  }
  return n
}

function readRawFromStorage(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  try {
    return window.localStorage.getItem(VISITED_SLUGS_STORAGE_KEY)
  } catch {
    console.warn(
      '[schulnavigator] visited slugs: localStorage read failed — progress unavailable',
    )
    return null
  }
}

function writeRawToStorage(serialized: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }
  try {
    window.localStorage.setItem(VISITED_SLUGS_STORAGE_KEY, serialized)
    return true
  } catch {
    console.warn(
      '[schulnavigator] visited slugs: localStorage write failed — visit not saved',
    )
    return false
  }
}

export function readVisitedSlugsFromStorage(
  validSlugs: ReadonlySet<string>,
): readonly string[] {
  return parseVisitedSlugs(readRawFromStorage(), validSlugs)
}

export function writeVisitedSlugsToStorage(
  slugs: readonly string[],
): boolean {
  return writeRawToStorage(JSON.stringify(slugs))
}

export function dispatchVisitedChanged(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(VISITED_CHANGED_EVENT))
}

export function markVisitedSlug(
  slug: string,
  validSlugs: ReadonlySet<string>,
): void {
  const current = readVisitedSlugsFromStorage(validSlugs)
  const next = addVisitedSlug(current, slug, validSlugs)
  if (next === current) {
    return
  }
  if (writeVisitedSlugsToStorage(next)) {
    dispatchVisitedChanged()
  }
}
