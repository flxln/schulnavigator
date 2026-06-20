import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  ingestCoachClip,
  MpzUploadError,
} from '@/lib/mpz-coach-audio-ingest'
import { mapCoachError, MpzCoachMessagesError } from '@/lib/mpz-coach-messages'

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

  const messageId = readField(form, 'messageId')
  if (!messageId) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Feld "messageId" ist erforderlich.' },
      { status: 400 },
    )
  }

  const collisionRaw = readField(form, 'collision')
  const collision =
    collisionRaw === 'reject' ? 'reject' : ('replace' as const)

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestCoachClip({
      messageId,
      source: { buffer },
      originalName: file.name || 'upload.wav',
      collision,
    })
    return NextResponse.json(
      {
        quelle: result.quelle,
        messageId: result.messageId,
        mtime: result.mtime ?? null,
        validation: result.validation ?? null,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof MpzCoachMessagesError) {
      const mapped = mapCoachError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Coach-Upload.' },
      { status: 500 },
    )
  }
})
