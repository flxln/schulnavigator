import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  auditDialogAudioForSlug,
  MpzUploadError,
} from '@/lib/mpz-dialog-audio-ingest'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async (req: NextRequest) => {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) {
    return NextResponse.json(
      { error: 'missing_slug', message: 'Query-Parameter "slug" fehlt.' },
      { status: 400 },
    )
  }

  try {
    const { segments, orphans } = await auditDialogAudioForSlug(slug)
    const missingCount = segments.filter((s) => s.state === 'leer' || s.state === 'fehlt').length
    const driftCount = segments.filter((s) => s.state === 'drift').length
    return NextResponse.json({
      slug,
      segments,
      orphans,
      missingCount,
      driftCount,
    })
  } catch (err) {
    if (err instanceof MpzUploadError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 422 })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Status konnte nicht geladen werden.' },
      { status: 500 },
    )
  }
})
