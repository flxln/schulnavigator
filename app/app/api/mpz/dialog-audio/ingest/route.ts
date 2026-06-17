import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  ingestDialogClip,
  MpzUploadError,
} from '@/lib/mpz-dialog-audio-ingest'

export const runtime = 'nodejs'

function readField(form: FormData, key: string): string | undefined {
  const v = form.get(key)
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function readBool(form: FormData, key: string): boolean {
  const v = readField(form, key)
  return v === 'true' || v === '1' || v === 'on'
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
  const segmentIndexRaw = readField(form, 'segmentIndex')
  if (!slug || segmentIndexRaw === undefined) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'Felder "slug" und "segmentIndex" sind erforderlich.' },
      { status: 400 },
    )
  }

  const segmentIndex = Number.parseInt(segmentIndexRaw, 10)
  if (Number.isNaN(segmentIndex)) {
    return NextResponse.json(
      { error: 'invalid_segment', message: 'segmentIndex muss eine Zahl sein.' },
      { status: 422 },
    )
  }

  const collisionRaw = readField(form, 'collision')
  const collision =
    collisionRaw === 'reject' ? 'reject' : ('replace' as const)

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestDialogClip({
      slug,
      segmentIndex,
      source: { buffer },
      originalName: file.name || 'upload.wav',
      collision,
      overrideQuelleDrift: readBool(form, 'overrideQuelleDrift'),
    })
    return NextResponse.json(
      {
        clip: result.clip,
        quelle: result.quelle,
        segmentId: result.segmentId,
        mtime: result.mtime ?? null,
        validation: result.validation ?? null,
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
      { error: 'internal', message: 'Unerwarteter Fehler beim Dialog-Upload.' },
      { status: 500 },
    )
  }
})
