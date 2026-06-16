import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  ingestMediumFile,
  MpzUploadError,
  type CollisionMode,
} from '@/lib/mpz-medium-ingest'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import { isUploadTyp } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

/**
 * Body-Size-Spike (#147, Pre-Mortem-Befund #1): Next.js 16.2 Route Handler mit
 * `runtime = 'nodejs'` + `req.formData()` nehmen einen 150-MB-multipart-Upload ohne
 * Zusatzkonfiguration an (verifiziert per curl gegen `next dev`, HTTP 200, ~0,9 s,
 * size = 157286400). Anders als Server Actions (1-MB-Default) gilt hier kein hartes
 * bodySizeLimit. Nur Dev-Studio (NODE_ENV=development), Single-Operator (ADR-022).
 */

function readField(form: FormData, key: string): string | undefined {
  const v = form.get(key)
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'invalid_form', message: 'Kein gültiges multipart/form-data.' },
      { status: 400 },
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'missing_file', message: 'Feld "file" fehlt oder ist keine Datei.' },
      { status: 400 },
    )
  }

  const slug = readField(form, 'slug')
  const typ = readField(form, 'typ')
  if (!slug || !typ) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'Felder "slug" und "typ" sind erforderlich.' },
      { status: 400 },
    )
  }
  if (!isUploadTyp(typ)) {
    return NextResponse.json(
      { error: 'invalid_typ', message: `Typ "${typ}" wird nicht unterstützt.` },
      { status: 422 },
    )
  }

  const collisionRaw = readField(form, 'collision')
  // API/UI-Default 'rename' (Befund #5) — projekttag-freundlich bei AirDrop-Doppeluploads.
  const collision: CollisionMode =
    collisionRaw === 'replace' || collisionRaw === 'reject' ? collisionRaw : 'rename'

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestMediumFile({
      slug,
      typ,
      source: { buffer },
      originalName: file.name || 'upload',
      id: readField(form, 'id'),
      untertitel: readField(form, 'untertitel'),
      collision,
    })
    return NextResponse.json(
      {
        medium: result.medium,
        quelle: result.quelle,
        filename: result.filename,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof MpzUploadError) {
      const status =
        err.code === 'COLLISION' ? 409 : err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Upload.' },
      { status: 500 },
    )
  }
})
