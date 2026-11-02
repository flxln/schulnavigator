import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  MpzUploadError,
  removeDialogClip,
} from '@/lib/mpz-dialog-audio-ingest'

export const runtime = 'nodejs'

// FIXME: Domain wirft MpzUploadError('VALIDATION') — Normalisierung zu VALIDATION_FAILED (#199-Tech-Debt).

export const DELETE = withMpzStudioAccess(async (req: NextRequest) => {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) {
    return NextResponse.json(
      { error: 'MISSING_SLUG', message: 'Query-Parameter "slug" fehlt.' },
      { status: 400 },
    )
  }

  const segmentIndexRaw = req.nextUrl.searchParams.get('segmentIndex')
  if (segmentIndexRaw === null || segmentIndexRaw === '') {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Query-Parameter "segmentIndex" fehlt.' },
      { status: 400 },
    )
  }

  const segmentIndex = Number.parseInt(segmentIndexRaw, 10)
  if (Number.isNaN(segmentIndex) || segmentIndex < 0) {
    return NextResponse.json(
      { error: 'INVALID_SEGMENT', message: 'segmentIndex muss eine Zahl ≥ 0 sein.' },
      { status: 422 },
    )
  }

  try {
    const result = await removeDialogClip(slug, segmentIndex)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzUploadError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Clip konnte nicht entfernt werden.' },
      { status: 500 },
    )
  }
})
