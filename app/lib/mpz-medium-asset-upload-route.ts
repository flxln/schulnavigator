import { NextResponse, type NextRequest } from 'next/server'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  uploadStationMediumAsset,
  type MediumAssetField,
} from '@/lib/mpz-medium-asset-upload'
import { MpzStationMedienError } from '@/lib/mpz-station-medien'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export async function handleMediumAssetUpload(
  req: NextRequest,
  slug: string,
  mediumId: string,
  field: MediumAssetField,
): Promise<NextResponse> {
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
    const result = await uploadStationMediumAsset({
      slug,
      mediumId,
      field,
      source: { buffer },
      originalName: file.name || 'upload',
    })
    return NextResponse.json(
      {
        medium: result.medium,
        field: result.field,
        path: result.path,
        previousPath: result.previousPath,
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
      {
        error: 'INTERNAL_ERROR',
        message: `Unerwarteter Fehler beim ${field}-Upload.`,
      },
      { status: 500 },
    )
  }
}
