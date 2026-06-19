import {
  createMpzContentIo,
  type HubConfigWriteResult,
  type MpzContentIo,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import { isLucideIconName } from '@/lib/lucide-icon-registry'
import {
  type HubConfigBundle,
  type HubSlugMapFile,
  type StationAccentsFile,
  type StationIconsFile,
} from '@/lib/mpz-hub-config-validation'

export type HubConfigErrorCode = 'INVALID_BODY'

export class MpzHubConfigError extends Error {
  readonly code: HubConfigErrorCode

  constructor(code: HubConfigErrorCode, message: string) {
    super(message)
    this.name = 'MpzHubConfigError'
    this.code = code
  }
}

export const HUB_CONFIG_CLIENT_ERROR_CODES = new Set<HubConfigErrorCode>(['INVALID_BODY'])

export function mapHubConfigError(
  err: MpzHubConfigError,
): { status: number; body: { error: string; message: string } } {
  const status = HUB_CONFIG_CLIENT_ERROR_CODES.has(err.code) ? 400 : 500
  return { status, body: { error: err.code, message: err.message } }
}

function isMappingRecord(value: unknown): value is Record<string, { slotId: string; nr: number }> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as { slotId?: unknown }).slotId === 'string' &&
      typeof (entry as { nr?: unknown }).nr === 'number',
  )
}

function isAccentRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every((entry) => typeof entry === 'string')
}

function isIconRecord(
  value: unknown,
): value is Record<string, { type: 'lucide'; name: string }> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  return Object.values(value).every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      (entry as { type?: unknown }).type === 'lucide' &&
      typeof (entry as { name?: unknown }).name === 'string',
  )
}

export function parsePutBody(body: unknown): HubConfigBundle | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (!isMappingRecord(raw.slugMap) || !isAccentRecord(raw.accents) || !isIconRecord(raw.icons)) {
    return null
  }
  return {
    slugMap: { mappings: raw.slugMap },
    accents: { accents: raw.accents },
    icons: { icons: raw.icons },
  }
}

export function normalizeHubConfig(bundle: HubConfigBundle): HubConfigBundle {
  const mappings: HubSlugMapFile['mappings'] = {}
  for (const [slug, mapping] of Object.entries(bundle.slugMap.mappings)) {
    mappings[slug] = {
      slotId: mapping.slotId.trim(),
      nr: Math.trunc(mapping.nr),
    }
  }

  const accents: StationAccentsFile['accents'] = {}
  for (const [slug, hex] of Object.entries(bundle.accents.accents)) {
    accents[slug] = hex.trim().toLowerCase()
  }

  const icons: StationIconsFile['icons'] = {}
  for (const [slug, icon] of Object.entries(bundle.icons.icons)) {
    if (icon.type === 'lucide' && isLucideIconName(icon.name)) {
      icons[slug] = { type: 'lucide', name: icon.name }
    } else {
      icons[slug] = icon
    }
  }

  const sortedMappings = Object.fromEntries(
    Object.entries(mappings).sort(([, a], [, b]) => a.nr - b.nr),
  )

  return {
    slugMap: { mappings: sortedMappings },
    accents: { accents },
    icons: { icons },
  }
}

export async function replaceHubConfig(
  rawBundle: HubConfigBundle,
  io: MpzContentIo = createMpzContentIo(),
): Promise<HubConfigWriteResult> {
  const bundle = normalizeHubConfig(rawBundle)

  return withMpzWriteLock(async () => {
    const stationsFile = await io.readStations()
    const writeResult = await io.writeHubConfig(bundle, {
      makeBackup: true,
      postValidate: true,
      stationsFile,
    })

    return {
      slugMap: bundle.slugMap.mappings,
      accents: bundle.accents.accents,
      icons: bundle.icons.icons,
      mtime: writeResult.mtime,
    }
  })
}
