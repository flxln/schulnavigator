import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import {
  createMpzContentIo,
  type MpzContentIo,
  MpzContentIoError,
  withMpzWriteLock,
} from '@/lib/mpz-content-io'
import {
  findMediumHotspotReferences,
  isMediaPathStillReferenced,
} from '@/lib/mpz-medium-references'
import {
  getEmbedAllowSuffixes,
  isEmbedAllowSubset,
  isEmbedUrlAllowed,
  resolveEmbedAllowlist,
} from '@/lib/embed-allowlist'
import { isValidHttpsUrl } from '@/lib/external-link'
import { uniqueMediumId } from '@/lib/mpz-medium-ingest'
import { slugifyId } from '@/lib/mpz-upload-rules'
import { isHubSlug } from '@/lib/schoolhouse-hub-map'
import type { LinkOpenIn, Medium, MediumTyp, Station, StationsFile, VideoSource } from '@/lib/types'

export type FileKeptReason = 'still-referenced' | 'not-local' | 'missing' | 'unlink-failed'

export type MediumPatchInput = {
  untertitel?: string | null
  thumbnail?: string | null
  poster?: string | null
  videoSource?: VideoSource
  quelle?: string | null
  openIn?: LinkOpenIn | null | ''
  embedAllow?: string[] | null
}

export type AddStationMediumInput = {
  typ: 'link' | 'embed'
  quelle: string
  id?: string
  untertitel?: string
  thumbnail?: string
  openIn?: 'external'
  embedAllow?: string[] | null
}

export type MediumErrorCode =
  | 'NOT_FOUND'
  | 'HOTSPOT_REFERENCE'
  | 'NO_FIELDS'
  | 'FIELD_NOT_ALLOWED'
  | 'INVALID_QUELLE'
  | 'INVALID_POSTER'
  | 'INVALID_THUMBNAIL'
  | 'INVALID_VIDEO_SOURCE'
  | 'INVALID_OPEN_IN'
  | 'INVALID_EMBED_ALLOW'
  | 'DUPLICATE_ID'
  | 'INVALID_ID'
  | 'INVALID_TYP'

/** @deprecated Verwende MediumErrorCode */
export type MediumRemoveErrorCode = 'NOT_FOUND' | 'HOTSPOT_REFERENCE'

export type RemoveMediumResult = {
  station: Station
  mtime: string | null
  fileDeleted: boolean
  quelle?: string
  fileKeptReason?: FileKeptReason
}

export class MpzStationMedienError extends Error {
  readonly code: MediumErrorCode
  readonly hotspotIds?: string[]

  constructor(
    code: MediumErrorCode,
    message: string,
    opts?: { hotspotIds?: string[] },
  ) {
    super(message)
    this.name = 'MpzStationMedienError'
    this.code = code
    this.hotspotIds = opts?.hotspotIds
  }
}

function findHubStation(data: StationsFile, slug: string): Station {
  if (!isHubSlug(slug)) {
    throw new MpzStationMedienError('NOT_FOUND', `Unbekannter Hub-Slug "${slug}".`)
  }
  const station = data.stations.find((s) => s.slug === slug)
  if (!station) {
    throw new MpzStationMedienError(
      'NOT_FOUND',
      `Station "${slug}" fehlt in stations.json.`,
    )
  }
  return station
}

const PATCH_KEYS_BY_TYP: Record<MediumTyp, readonly (keyof MediumPatchInput)[]> = {
  audio: ['untertitel', 'thumbnail'],
  foto: ['untertitel', 'thumbnail'],
  text: ['untertitel', 'thumbnail'],
  video: ['untertitel', 'thumbnail', 'poster', 'videoSource'],
  link: ['untertitel', 'thumbnail', 'quelle', 'openIn'],
  embed: ['untertitel', 'thumbnail', 'quelle', 'embedAllow'],
}

function allowedPatchKeys(typ: MediumTyp): Set<keyof MediumPatchInput> {
  return new Set(PATCH_KEYS_BY_TYP[typ])
}

function isOptionalStringClear(value: unknown): boolean {
  return value === null || value === ''
}

const MEDIUM_ID_RE = /^[a-z0-9][a-z0-9-]*$/

function validateMediumId(id: string): void {
  if (!id || !MEDIUM_ID_RE.test(id)) {
    throw new MpzStationMedienError(
      'INVALID_ID',
      `Medium-ID "${id}" ist ungültig (erwartet: Kleinbuchstaben, Ziffern, Bindestriche; z. B. kunst-link).`,
    )
  }
}

export function validateLinkEmbedState(medium: Medium): void {
  if (medium.typ !== 'link' && medium.typ !== 'embed') {
    return
  }

  if (medium.thumbnail !== undefined && !medium.thumbnail.startsWith('/')) {
    throw new MpzStationMedienError(
      'INVALID_THUMBNAIL',
      'thumbnail muss ein Pfad mit führendem / sein.',
    )
  }

  if (medium.typ === 'link') {
    if (medium.embedAllow !== undefined) {
      throw new MpzStationMedienError(
        'FIELD_NOT_ALLOWED',
        'embedAllow ist für typ "link" nicht erlaubt.',
      )
    }
    if (!isValidHttpsUrl(medium.quelle)) {
      throw new MpzStationMedienError(
        'INVALID_QUELLE',
        'link.quelle muss eine gültige https-URL sein.',
      )
    }
    if (medium.openIn !== undefined && medium.openIn !== 'external') {
      throw new MpzStationMedienError(
        'INVALID_OPEN_IN',
        "openIn muss 'external' sein.",
      )
    }
    return
  }

  if (medium.openIn !== undefined) {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      'openIn ist für typ "embed" nicht erlaubt.',
    )
  }

  if (medium.embedAllow !== undefined) {
    for (const entry of medium.embedAllow) {
      if (typeof entry !== 'string' || entry.includes('/')) {
        throw new MpzStationMedienError(
          'INVALID_EMBED_ALLOW',
          `embedAllow darf nur Einträge aus ${getEmbedAllowSuffixes().join(', ')} enthalten.`,
        )
      }
    }
    if (!isEmbedAllowSubset(medium.embedAllow)) {
      throw new MpzStationMedienError(
        'INVALID_EMBED_ALLOW',
        `embedAllow darf nur Einträge aus ${getEmbedAllowSuffixes().join(', ')} enthalten.`,
      )
    }
  }

  const allowlist = resolveEmbedAllowlist({ embedAllow: medium.embedAllow })
  if (!isEmbedUrlAllowed(medium.quelle, allowlist)) {
    throw new MpzStationMedienError(
      'INVALID_QUELLE',
      'embed.quelle muss eine gültige https-URL auf der Allowlist-Domain sein.',
    )
  }
}

function assertFieldAllowed(
  typ: MediumTyp,
  key: keyof MediumPatchInput,
): void {
  if (!allowedPatchKeys(typ).has(key)) {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      `Feld "${key}" ist für typ "${typ}" nicht per PATCH änderbar.`,
    )
  }
}

function normalizeMediumPatch(
  existing: Medium,
  patch: MediumPatchInput,
): { set: Partial<Medium>; remove: (keyof Medium)[] } {
  const patchKeys = Object.keys(patch) as (keyof MediumPatchInput)[]
  for (const key of patchKeys) {
    assertFieldAllowed(existing.typ, key)
  }

  const set: Partial<Medium> = {}
  const remove: (keyof Medium)[] = []

  if ('untertitel' in patch) {
    if (isOptionalStringClear(patch.untertitel)) {
      remove.push('untertitel')
    } else if (typeof patch.untertitel === 'string') {
      set.untertitel = patch.untertitel
    }
  }

  if ('thumbnail' in patch) {
    if (isOptionalStringClear(patch.thumbnail)) {
      remove.push('thumbnail')
    } else if (typeof patch.thumbnail === 'string') {
      if (!patch.thumbnail.startsWith('/')) {
        throw new MpzStationMedienError(
          'INVALID_THUMBNAIL',
          'thumbnail muss ein Pfad mit führendem / sein.',
        )
      }
      set.thumbnail = patch.thumbnail
    }
  }

  if ('poster' in patch) {
    if (isOptionalStringClear(patch.poster)) {
      remove.push('poster')
    } else if (typeof patch.poster === 'string') {
      if (!patch.poster.startsWith('/')) {
        throw new MpzStationMedienError(
          'INVALID_POSTER',
          'poster muss ein Pfad mit führendem / sein.',
        )
      }
      set.poster = patch.poster
    }
  }

  if ('videoSource' in patch) {
    if (patch.videoSource !== 'upload' && patch.videoSource !== 'youtube') {
      throw new MpzStationMedienError(
        'INVALID_VIDEO_SOURCE',
        'videoSource muss upload oder youtube sein.',
      )
    }
    set.videoSource = patch.videoSource
  }

  if ('quelle' in patch) {
    if (isOptionalStringClear(patch.quelle)) {
      throw new MpzStationMedienError(
        'INVALID_QUELLE',
        'quelle darf nicht leer sein.',
      )
    }
    if (typeof patch.quelle === 'string') {
      set.quelle = patch.quelle
    }
  }

  if ('openIn' in patch) {
    if (isOptionalStringClear(patch.openIn)) {
      remove.push('openIn')
    } else if (patch.openIn === 'external') {
      set.openIn = 'external'
    } else {
      throw new MpzStationMedienError(
        'INVALID_OPEN_IN',
        "openIn muss 'external' sein oder entfernt werden.",
      )
    }
  }

  if ('embedAllow' in patch) {
    if (
      patch.embedAllow === null ||
      (Array.isArray(patch.embedAllow) && patch.embedAllow.length === 0)
    ) {
      remove.push('embedAllow')
    } else if (Array.isArray(patch.embedAllow)) {
      for (const entry of patch.embedAllow) {
        if (typeof entry !== 'string' || entry.includes('/')) {
          throw new MpzStationMedienError(
            'INVALID_EMBED_ALLOW',
            `embedAllow darf nur Einträge aus ${getEmbedAllowSuffixes().join(', ')} enthalten.`,
          )
        }
      }
      if (!isEmbedAllowSubset(patch.embedAllow)) {
        throw new MpzStationMedienError(
          'INVALID_EMBED_ALLOW',
          `embedAllow darf nur Einträge aus ${getEmbedAllowSuffixes().join(', ')} enthalten.`,
        )
      }
      set.embedAllow = patch.embedAllow
    } else {
      throw new MpzStationMedienError(
        'INVALID_EMBED_ALLOW',
        'embedAllow muss ein Array sein.',
      )
    }
  }

  if (remove.length === 0 && Object.keys(set).length === 0) {
    throw new MpzStationMedienError('NO_FIELDS', 'Keine Felder zum Aktualisieren.')
  }

  const merged: Medium = { ...existing, ...set }
  for (const key of remove) {
    const record = merged as unknown as Record<string, unknown>
    delete record[key]
  }

  validateLinkEmbedState(merged)

  return { set, remove }
}

export function resolvePublicMediaPath(
  appRoot: string,
  quelle: string,
  slug: string,
): string | null {
  if (!quelle.startsWith(`/media/${slug}/`)) {
    return null
  }
  const mediaRoot = normalize(join(appRoot, 'public', 'media', slug))
  const candidate = normalize(join(appRoot, 'public', quelle.slice(1)))
  const prefix = `${mediaRoot}/`
  if (candidate !== mediaRoot && !candidate.startsWith(prefix)) {
    return null
  }
  return candidate
}

export async function tryDeleteMediaFile(
  appRoot: string,
  slug: string,
  quelle: string,
  filteredStation: Station,
): Promise<{ fileDeleted: boolean; fileKeptReason?: FileKeptReason }> {
  if (!quelle.startsWith(`/media/${slug}/`)) {
    return { fileDeleted: false, fileKeptReason: 'not-local' }
  }

  // postValidate validiert vor dem rename und deckt diese Datei-Löschung nicht ab.
  if (isMediaPathStillReferenced(filteredStation, quelle)) {
    return { fileDeleted: false, fileKeptReason: 'still-referenced' }
  }

  const filePath = resolvePublicMediaPath(appRoot, quelle, slug)
  if (!filePath || !existsSync(filePath)) {
    return { fileDeleted: false, fileKeptReason: 'missing' }
  }

  try {
    await unlink(filePath)
    return { fileDeleted: true }
  } catch {
    return { fileDeleted: false, fileKeptReason: 'unlink-failed' }
  }
}

export async function removeStationMedium(
  slug: string,
  mediumId: string,
  io: MpzContentIo = createMpzContentIo(),
): Promise<RemoveMediumResult> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const medium = station.medien.find((m) => m.id === mediumId)
    if (!medium) {
      throw new MpzStationMedienError(
        'NOT_FOUND',
        `Medium "${mediumId}" nicht in Station "${slug}" gefunden.`,
      )
    }

    const hotspotRefs = findMediumHotspotReferences(station, mediumId)
    const hotspotIds = [...hotspotRefs.flat, ...hotspotRefs.sphere]
    if (hotspotIds.length > 0) {
      throw new MpzStationMedienError(
        'HOTSPOT_REFERENCE',
        `Medium "${mediumId}" wird von Hotspot(s) referenziert: ${hotspotIds.join(', ')}.`,
        { hotspotIds },
      )
    }

    const quelle = medium.quelle
    const filteredStation: Station = {
      ...station,
      medien: station.medien.filter((m) => m.id !== mediumId),
    }
    const nextStations = data.stations.map((s) => (s.slug === slug ? filteredStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    const { appRoot } = io.getPaths()
    const fileResult = await tryDeleteMediaFile(appRoot, slug, quelle, filteredStation)

    return {
      station: filteredStation,
      mtime: writeResult.mtime,
      fileDeleted: fileResult.fileDeleted,
      quelle,
      fileKeptReason: fileResult.fileKeptReason,
    }
  })
}

export async function patchStationMedium(
  slug: string,
  mediumId: string,
  patch: MediumPatchInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ station: Station; mtime: string | null }> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const mediumIndex = station.medien.findIndex((m) => m.id === mediumId)
    if (mediumIndex === -1) {
      throw new MpzStationMedienError(
        'NOT_FOUND',
        `Medium "${mediumId}" nicht in Station "${slug}" gefunden.`,
      )
    }

    const existing = station.medien[mediumIndex]!
    const { set, remove } = normalizeMediumPatch(existing, patch)

    const updatedMedium: Medium = { ...existing, ...set }
    for (const key of remove) {
      const record = updatedMedium as unknown as Record<string, unknown>
      delete record[key]
    }

    const nextMedien = [...station.medien]
    nextMedien[mediumIndex] = updatedMedium
    const filteredStation: Station = { ...station, medien: nextMedien }
    const nextStations = data.stations.map((s) => (s.slug === slug ? filteredStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    return {
      station: filteredStation,
      mtime: writeResult.mtime,
    }
  })
}

function buildLinkEmbedMedium(
  slug: string,
  input: AddStationMediumInput,
  existingIds: Set<string>,
): Medium {
  if (input.typ !== 'link' && input.typ !== 'embed') {
    throw new MpzStationMedienError(
      'INVALID_TYP',
      `typ "${String(input.typ)}" ist nicht erlaubt — nur link oder embed.`,
    )
  }

  if (input.typ === 'link' && input.embedAllow != null && input.embedAllow.length > 0) {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      'embedAllow ist für typ "link" nicht erlaubt.',
    )
  }

  if (input.typ === 'embed' && input.openIn !== undefined) {
    throw new MpzStationMedienError(
      'FIELD_NOT_ALLOWED',
      'openIn ist für typ "embed" nicht erlaubt.',
    )
  }

  const trimmedQuelle = input.quelle.trim()
  if (!trimmedQuelle) {
    throw new MpzStationMedienError('INVALID_QUELLE', 'quelle darf nicht leer sein.')
  }

  const rawId = input.id?.trim()
  let mediumId: string
  if (rawId) {
    validateMediumId(rawId)
    mediumId = rawId
  } else {
    mediumId = uniqueMediumId(existingIds, slugifyId(`${slug}-${input.typ}`))
  }

  if (existingIds.has(mediumId)) {
    throw new MpzStationMedienError(
      'DUPLICATE_ID',
      `Medium-ID "${mediumId}" existiert bereits in Station "${slug}".`,
    )
  }

  const medium: Medium = {
    id: mediumId,
    typ: input.typ,
    quelle: trimmedQuelle,
  }

  if (input.untertitel !== undefined && input.untertitel.trim() !== '') {
    medium.untertitel = input.untertitel.trim()
  }

  if (input.thumbnail !== undefined && input.thumbnail.trim() !== '') {
    medium.thumbnail = input.thumbnail.trim()
  }

  if (input.typ === 'link' && input.openIn === 'external') {
    medium.openIn = 'external'
  }

  if (input.typ === 'embed' && input.embedAllow != null && input.embedAllow.length > 0) {
    medium.embedAllow = input.embedAllow
  }

  validateLinkEmbedState(medium)

  return medium
}

export async function addStationMedium(
  slug: string,
  input: AddStationMediumInput,
  io: MpzContentIo = createMpzContentIo(),
): Promise<{ station: Station; mtime: string | null }> {
  return withMpzWriteLock(async () => {
    const data = await io.readStations()
    const station = findHubStation(data, slug)
    const existingIds = new Set((station.medien ?? []).map((m) => m.id))
    const medium = buildLinkEmbedMedium(slug, input, existingIds)
    const nextMedien = [...(station.medien ?? []), medium]
    const nextStation: Station = { ...station, medien: nextMedien }
    const nextStations = data.stations.map((s) => (s.slug === slug ? nextStation : s))

    const writeResult = await io.writeStations(
      { stations: nextStations },
      {
        strict: true,
        validateAssets: false,
        canonicalize: false,
        makeBackup: true,
        postValidate: true,
        touchedSlugs: [slug],
      },
    )

    return {
      station: nextStation,
      mtime: writeResult.mtime,
    }
  })
}

export { MpzContentIoError }
