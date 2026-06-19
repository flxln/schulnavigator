import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { ingestBrandAsset } from '@/lib/mpz-brand-ingest'
import { getBrandSlot } from '@/lib/mpz-brand-validation'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

function readField(form: FormData, key: string): string | undefined {
  const v = form.get(key)
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function formatBytes(bytes: number): string {
  const KB = 1024
  const MB = 1024 * KB
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.round(bytes / KB)} KB`
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

  const slotId = readField(form, 'slot')
  if (!slotId) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Feld "slot" ist erforderlich.' },
      { status: 400 },
    )
  }

  const slot = getBrandSlot(slotId)
  if (!slot) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: `Unbekannter Slot "${slotId}".` },
      { status: 400 },
    )
  }

  if (file.size > slot.maxBytes) {
    return NextResponse.json(
      {
        error: 'VALIDATION',
        message: `${file.name}: Datei ist zu groß (${formatBytes(file.size)}; max. ${formatBytes(slot.maxBytes)}).`,
      },
      { status: 422 },
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    const result = await ingestBrandAsset({
      slotId,
      source: { buffer },
      originalName: file.name || 'upload',
    })
    return NextResponse.json(
      { path: result.path, filename: result.filename, mtime: result.mtime },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof MpzUploadError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Upload.' },
      { status: 500 },
    )
  }
})
