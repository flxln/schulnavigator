import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  applySphereHotspotCoords,
  MpzHotspotCalibError,
} from '@/lib/mpz-hotspot-calib'

export const runtime = 'nodejs'

type SphereBody = {
  slug?: string
  hotspotId?: string
  yaw?: number
  pitch?: number
}

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: SphereBody
  try {
    body = (await req.json()) as SphereBody
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const { slug, hotspotId, yaw, pitch } = body
  if (
    typeof slug !== 'string' ||
    !slug ||
    typeof hotspotId !== 'string' ||
    !hotspotId ||
    typeof yaw !== 'number' ||
    typeof pitch !== 'number'
  ) {
    return NextResponse.json(
      {
        error: 'MISSING_FIELDS',
        message: 'Felder slug, hotspotId, yaw und pitch sind erforderlich.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await applySphereHotspotCoords({ slug, hotspotId, yaw, pitch })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof MpzHotspotCalibError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Hotspot-Update.' },
      { status: 500 },
    )
  }
})
