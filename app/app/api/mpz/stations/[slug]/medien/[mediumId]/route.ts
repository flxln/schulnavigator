import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationMedienError,
  patchStationMedium,
  removeStationMedium,
  type MediumPatchInput,
} from '@/lib/mpz-station-medien'
import type { LinkOpenIn, VideoSource } from '@/lib/types'

export const runtime = 'nodejs'

const PATCH_CLIENT_ERROR_CODES = new Set([
  'NO_FIELDS',
  'FIELD_NOT_ALLOWED',
  'INVALID_QUELLE',
  'INVALID_POSTER',
  'INVALID_THUMBNAIL',
  'INVALID_VIDEO_SOURCE',
  'INVALID_OPEN_IN',
  'INVALID_EMBED_ALLOW',
])

function isVideoSource(value: unknown): value is VideoSource {
  return value === 'upload' || value === 'youtube'
}

function isOpenIn(value: unknown): value is LinkOpenIn {
  return value === 'external'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isEmbedAllowValue(value: unknown): value is string[] | null {
  if (value === null) return true
  if (!Array.isArray(value)) return false
  return value.every((entry) => typeof entry === 'string')
}

export function parsePatch(body: unknown): MediumPatchInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: MediumPatchInput = {}

  if (Object.hasOwn(raw, 'untertitel')) {
    if (!isNullableString(raw.untertitel)) return null
    patch.untertitel = raw.untertitel
  }
  if (Object.hasOwn(raw, 'thumbnail')) {
    if (!isNullableString(raw.thumbnail)) return null
    patch.thumbnail = raw.thumbnail
  }
  if (Object.hasOwn(raw, 'poster')) {
    if (!isNullableString(raw.poster)) return null
    patch.poster = raw.poster
  }
  if (Object.hasOwn(raw, 'videoSource')) {
    if (!isVideoSource(raw.videoSource)) return null
    patch.videoSource = raw.videoSource
  }
  if (Object.hasOwn(raw, 'quelle')) {
    if (!isNullableString(raw.quelle)) return null
    patch.quelle = raw.quelle
  }
  if (Object.hasOwn(raw, 'openIn')) {
    if (raw.openIn === null || raw.openIn === '' || isOpenIn(raw.openIn)) {
      patch.openIn = raw.openIn as LinkOpenIn | null | ''
    } else {
      return null
    }
  }
  if (Object.hasOwn(raw, 'embedAllow')) {
    if (!isEmbedAllowValue(raw.embedAllow)) return null
    patch.embedAllow = raw.embedAllow
  }

  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

function mapMediumPatchError(
  err: MpzStationMedienError,
): { status: number; body: { error: string; message: string } } {
  if (err.code === 'NOT_FOUND') {
    return { status: 404, body: { error: err.code, message: err.message } }
  }
  if (err.code === 'NO_FIELDS') {
    return { status: 400, body: { error: err.code, message: err.message } }
  }
  const status = PATCH_CLIENT_ERROR_CODES.has(err.code) ? 422 : 500
  return { status, body: { error: err.code, message: err.message } }
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', mediumId = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const patch = parsePatch(body)
  if (!patch) {
    return NextResponse.json(
      {
        error: 'invalid_body',
        message:
          'Body muss mindestens ein gültiges Feld (untertitel, thumbnail, poster, videoSource, quelle, openIn, embedAllow) enthalten.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await patchStationMedium(slug, mediumId, patch)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationMedienError) {
      const mapped = mapMediumPatchError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Speichern des Mediums.' },
      { status: 500 },
    )
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '', mediumId = '' } = await context!.params
  try {
    const result = await removeStationMedium(slug, mediumId)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationMedienError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Entfernen des Mediums.' },
      { status: 500 },
    )
  }
})
