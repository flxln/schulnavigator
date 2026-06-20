import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  applyFlatStartPan,
  MpzViewIngestError,
} from '@/lib/mpz-view-ingest'

export const runtime = 'nodejs'

type FlatViewBody = {
  slug?: string
  startPanX?: number
}

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: FlatViewBody
  try {
    body = (await req.json()) as FlatViewBody
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const { slug, startPanX } = body
  if (typeof slug !== 'string' || !slug || typeof startPanX !== 'number') {
    return NextResponse.json(
      {
        error: 'MISSING_FIELDS',
        message: 'Felder slug und startPanX sind erforderlich.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await applyFlatStartPan({ slug, startPanX })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof MpzViewIngestError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Startpan-Update.' },
      { status: 500 },
    )
  }
})
