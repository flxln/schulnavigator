export type AccessMode = 'gated' | 'open'

export function parseAccessMode(raw: string | undefined): AccessMode {
  if (raw === 'open') {
    return 'open'
  }
  return 'gated'
}

let cachedMode: AccessMode | undefined

export function getAccessMode(): AccessMode {
  if (cachedMode === undefined) {
    cachedMode = parseAccessMode(process.env.SN_ACCESS_MODE)
  }
  return cachedMode
}

export function isAccessGated(): boolean {
  return getAccessMode() === 'gated'
}

/** Nur für Tests — Modul-Cache zurücksetzen. */
export function resetAccessConfigCacheForTests(): void {
  cachedMode = undefined
}
