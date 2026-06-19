import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  ingestStationRaumbild,
  type RaumbildVariant,
} from '@/lib/mpz-station-raumbild-ingest'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

function readField(form: FormData, key: string): string | undefined {
  const v = form.get(key)
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function parseVariant(value: string | undefined): RaumbildVariant | null {
  if (value === 'flat' || value === 'pano360') return value
  return null
}

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_FORM', message: 'Kein gültiges multipart/form-data.' },
      { status: 400 },
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'MISSING_FILE', message: 'Feld "file" fehlt oder ist keine Datei.' },
      { status: 400 },
    )
  }

  const variantRaw = readField(form, 'variant')
  if (!variantRaw) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Feld "variant" ist erforderlich.' },
      { status: 400 },
    )
  }

  const variant = parseVariant(variantRaw)
  if (!variant) {
    return NextResponse.json(
      {
        error: 'VALIDATION',
        message: 'variant muss flat oder pano360 sein.',
      },
      { status: 422 },
    )
  }

  const collisionRaw = readField(form, 'collision')
  const collision = collisionRaw === 'replace' ? 'replace' : 'reject'

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestStationRaumbild({
      slug,
      variant,
      source: { buffer },
      originalName: file.name || 'upload.jpg',
      collision,
    })
    return NextResponse.json(result, { status: 200 })
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Raumbild-Upload.' },
      { status: 500 },
    )
  }
})
