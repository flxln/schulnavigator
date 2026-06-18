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
  'INVALID_ID',
  'INVALID_COORDS',
  'INVALID_ICON',
  'INVALID_ICON_SIZE',
])

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  let body: AddStationHotspotInput
  try {
    body = (await req.json()) as AddStationHotspotInput
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Ungültiger JSON-Body.' },
      { status: 400 },
    )
  }

  try {
    const result = await addStationHotspot(slug, body)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationHotspotsError) {
      // NOT_EDITABLE bewusst nicht gemappt — addStationHotspot wirft ihn nicht; bei Domain-Erweiterung mapHotspotError aus [hotspotId]/route.ts nutzen
      const status = err.code === 'NOT_FOUND' ? 404 : CLIENT_ERROR_CODES.has(err.code) ? 400 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Anlegen des Hotspots.' },
      { status: 500 },
    )
  }
})
