import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  applySphereStartView,
  MpzViewIngestError,
} from '@/lib/mpz-view-ingest'

export const runtime = 'nodejs'

type SphereViewBody = {
  slug?: string
  startYaw?: number
  startPitch?: number
}

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: SphereViewBody
  try {
    body = (await req.json()) as SphereViewBody
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const { slug, startYaw, startPitch } = body
  if (
    typeof slug !== 'string' ||
    !slug ||
    typeof startYaw !== 'number' ||
    typeof startPitch !== 'number'
  ) {
    return NextResponse.json(
      {
        error: 'missing_fields',
        message: 'Felder slug, startYaw und startPitch sind erforderlich.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await applySphereStartView({ slug, startYaw, startPitch })
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
      { error: 'internal', message: 'Unerwarteter Fehler beim Startblick-Update.' },
      { status: 500 },
    )
  }
})
