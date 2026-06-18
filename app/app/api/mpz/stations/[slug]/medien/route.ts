import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  addStationMedium,
  MpzStationMedienError,
  type AddStationMediumInput,
} from '@/lib/mpz-station-medien'

export const runtime = 'nodejs'

// lowercase invalid_json/invalid_body — konsistent mit medien/[mediumId]/route.ts;
// Hotspots-Route nutzt INVALID_BODY uppercase (Tech-Debt, nicht hier übernehmen).
const POST_CLIENT_ERROR_400 = new Set(['INVALID_TYP', 'INVALID_ID', 'DUPLICATE_ID'])
const POST_CLIENT_ERROR_422 = new Set([
  'INVALID_QUELLE',
  'INVALID_THUMBNAIL',
  'INVALID_OPEN_IN',
  'INVALID_EMBED_ALLOW',
  'FIELD_NOT_ALLOWED',
])

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}

function isEmbedAllowValue(value: unknown): value is string[] | null | undefined {
  if (value === undefined || value === null) return true
  if (!Array.isArray(value)) return false
  return value.every((entry) => typeof entry === 'string')
}

export function parseCreate(body: unknown): AddStationMediumInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>

  if (!isNonEmptyString(raw.typ)) {
    return null
  }
  if (!isNonEmptyString(raw.quelle)) {
    return null
  }

  const input: AddStationMediumInput = {
    typ: raw.typ as AddStationMediumInput['typ'],
    quelle: raw.quelle,
  }

  if (Object.hasOwn(raw, 'id')) {
    if (!isOptionalString(raw.id) || raw.id === '') {
      return null
    }
    input.id = raw.id
  }

  if (Object.hasOwn(raw, 'untertitel')) {
    if (!isOptionalString(raw.untertitel)) {
      return null
    }
    input.untertitel = raw.untertitel
  }

  if (Object.hasOwn(raw, 'thumbnail')) {
    if (!isOptionalString(raw.thumbnail)) {
      return null
    }
    input.thumbnail = raw.thumbnail
  }

  if (Object.hasOwn(raw, 'openIn')) {
    // Nur Typ-Guard (strukturell). Wert-Validierung ('external' vs. anderer String)
    // übernimmt die Domain → INVALID_OPEN_IN (422) statt 400 invalid_body.
    if (typeof raw.openIn !== 'string') {
      return null
    }
    input.openIn = raw.openIn as 'external'
  }

  if (Object.hasOwn(raw, 'embedAllow')) {
    if (!isEmbedAllowValue(raw.embedAllow)) {
      return null
    }
    input.embedAllow = raw.embedAllow
  }

  return input
}

function mapMediumCreateError(
  err: MpzStationMedienError,
): { status: number; body: { error: string; message: string } } {
  if (err.code === 'NOT_FOUND') {
    return { status: 404, body: { error: err.code, message: err.message } }
  }
  if (POST_CLIENT_ERROR_400.has(err.code)) {
    return { status: 400, body: { error: err.code, message: err.message } }
  }
  if (POST_CLIENT_ERROR_422.has(err.code)) {
    return { status: 422, body: { error: err.code, message: err.message } }
  }
  return { status: 500, body: { error: err.code, message: err.message } }
}

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const input = parseCreate(body)
  if (!input) {
    return NextResponse.json(
      {
        error: 'invalid_body',
        message:
          'Body muss typ (link|embed) und quelle (string) enthalten; optionale Felder: id, untertitel, thumbnail, openIn, embedAllow.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await addStationMedium(slug, input)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationMedienError) {
      const mapped = mapMediumCreateError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Anlegen des Mediums.' },
      { status: 500 },
    )
  }
})
