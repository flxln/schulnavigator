import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  replaceStationMediumFile,
} from '@/lib/mpz-medium-replace'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', mediumId = '' } = await context!.params

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

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await replaceStationMediumFile({
      slug,
      mediumId,
      source: { buffer },
      originalName: file.name || 'upload',
    })
    return NextResponse.json(
      {
        medium: result.medium,
        quelle: result.quelle,
        previousQuelle: result.previousQuelle,
        fileReplaced: result.fileReplaced,
        previousFileDeleted: result.previousFileDeleted,
        mtime: result.mtime,
        validation: result.validation ?? null,
      },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof MpzStationMedienError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzUploadError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Ersetzen der Mediendatei.' },
      { status: 500 },
    )
  }
})
