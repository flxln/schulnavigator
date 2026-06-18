import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationHotspotsError,
  patchStationHotspot,
  removeStationHotspot,
  type PatchStationHotspotInput,
} from '@/lib/mpz-station-hotspots'

export const runtime = 'nodejs'

// sync with hotspots/route.ts; Single Source of Truth folgt im Dedup-Follow-up
const CLIENT_ERROR_CODES = new Set([
  'DUPLICATE_ID',
  'MEDIUM_NOT_FOUND',
  'NO_MEDIAS',
  'INVALID_ID',
  'INVALID_COORDS',
  'INVALID_ICON',
  'INVALID_ICON_SIZE',
])

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

export function parsePatch(body: unknown): PatchStationHotspotInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: PatchStationHotspotInput = {}

  if (Object.hasOwn(raw, 'label')) {
    if (typeof raw.label !== 'string') return null
    patch.label = raw.label
  }
  if (Object.hasOwn(raw, 'mediumId')) {
    if (typeof raw.mediumId !== 'string' || !raw.mediumId.trim()) return null
    patch.mediumId = raw.mediumId
  }
  if (Object.hasOwn(raw, 'x')) {
    if (typeof raw.x !== 'number' || !Number.isFinite(raw.x)) return null
    patch.x = raw.x
  }
  if (Object.hasOwn(raw, 'y')) {
    if (typeof raw.y !== 'number' || !Number.isFinite(raw.y)) return null
    patch.y = raw.y
  }
  if (Object.hasOwn(raw, 'yaw')) {
    if (typeof raw.yaw !== 'number' || !Number.isFinite(raw.yaw)) return null
    patch.yaw = raw.yaw
  }
  if (Object.hasOwn(raw, 'pitch')) {
    if (typeof raw.pitch !== 'number' || !Number.isFinite(raw.pitch)) return null
    patch.pitch = raw.pitch
  }
  if (Object.hasOwn(raw, 'icon')) {
    if (!isNullableString(raw.icon)) return null
    patch.icon = raw.icon
  }
  if (Object.hasOwn(raw, 'iconSize')) {
    if (!isNullableNumber(raw.iconSize)) return null
    patch.iconSize = raw.iconSize
  }

  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

function mapHotspotError(err: MpzStationHotspotsError): { status: number; body: { error: string; message: string } } {
  if (err.code === 'NOT_FOUND') {
    return { status: 404, body: { error: err.code, message: err.message } }
  }
  if (err.code === 'NOT_EDITABLE') {
    return { status: 403, body: { error: err.code, message: err.message } }
  }
  const status = CLIENT_ERROR_CODES.has(err.code) ? 400 : 500
  return { status, body: { error: err.code, message: err.message } }
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', hotspotId = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Ungültiger JSON-Body.' },
      { status: 400 },
    )
  }

  const patch = parsePatch(body)
  if (!patch) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message:
          'Body muss mindestens ein gültiges Feld (label, mediumId, x, y, yaw, pitch, icon, iconSize) enthalten.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await patchStationHotspot(slug, hotspotId, patch)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationHotspotsError) {
      const mapped = mapHotspotError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Bearbeiten des Hotspots.' },
      { status: 500 },
    )
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '', hotspotId = '' } = await context!.params
  try {
    const result = await removeStationHotspot(slug, hotspotId)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationHotspotsError) {
      const mapped = mapHotspotError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Entfernen des Hotspots.' },
      { status: 500 },
    )
  }
})
