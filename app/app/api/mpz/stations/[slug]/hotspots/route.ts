import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  addStationHotspot,
  MpzStationHotspotsError,
  type AddStationHotspotInput,
} from '@/lib/mpz-station-hotspots'

export const runtime = 'nodejs'

// sync with [hotspotId]/route.ts; Single Source of Truth folgt im Dedup-Follow-up
const CLIENT_ERROR_CODES = new Set([
  'DUPLICATE_ID',
  'MEDIUM_NOT_FOUND',
  'NO_MEDIAS',
  'NO_DIALOG',
  'MASCOT_NOT_IN_FIGUREN',
  'INVALID_MASCOT_SIZE',
  'INVALID_BUBBLE_PITCH',
  'FORBIDDEN_FIELD',
  'INVALID_ID',
  'INVALID_COORDS',
  'INVALID_ICON',
  'INVALID_ICON_SIZE',
])

function parsePostBody(body: unknown): AddStationHotspotInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (Object.hasOwn(raw, 'action')) {
    if (raw.action !== 'medium' && raw.action !== 'dialog') {
      return null
    }
  }
  return body as AddStationHotspotInput
}

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Ungültiger JSON-Body.' },
      { status: 400 },
    )
  }

  const body = parsePostBody(parsed)
  if (!body) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message: 'Ungültiger JSON-Body oder ungültiger action-Wert (erwartet: medium oder dialog).',
      },
      { status: 400 },
    )
  }

  try {
    const result = await addStationHotspot(slug, body)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationHotspotsError) {
      const status = err.code === 'NOT_FOUND' ? 404 : CLIENT_ERROR_CODES.has(err.code) ? 400 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Anlegen des Hotspots.' },
      { status: 500 },
    )
  }
})
