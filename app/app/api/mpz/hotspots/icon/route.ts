import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  ingestHotspotIcon,
  type IconCollisionMode,
} from '@/lib/mpz-hotspot-icon-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

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
  if (!slug) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'Feld "slug" ist erforderlich.' },
      { status: 400 },
    )
  }

  const collisionRaw = readField(form, 'collision')
  const collision: IconCollisionMode =
    collisionRaw === 'replace' ? 'replace' : 'reject'

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestHotspotIcon({
      slug,
      source: { buffer },
      originalName: file.name || 'upload.svg',
      collision,
    })
    return NextResponse.json(
      { path: result.path, filename: result.filename },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof MpzUploadError) {
      const status =
        err.code === 'COLLISION' ? 409 : err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Upload.' },
      { status: 500 },
    )
  }
})
