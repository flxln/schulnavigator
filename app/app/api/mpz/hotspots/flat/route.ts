import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  applyFlatHotspotCoords,
  MpzHotspotCalibError,
} from '@/lib/mpz-hotspot-calib'

export const runtime = 'nodejs'

type FlatBody = {
  slug?: string
  hotspotId?: string
  x?: number
  y?: number
}

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: FlatBody
  try {
    body = (await req.json()) as FlatBody
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const { slug, hotspotId, x, y } = body
  if (
    typeof slug !== 'string' ||
    !slug ||
    typeof hotspotId !== 'string' ||
    !hotspotId ||
    typeof x !== 'number' ||
    typeof y !== 'number'
  ) {
    return NextResponse.json(
      {
        error: 'MISSING_FIELDS',
        message: 'Felder slug, hotspotId, x und y sind erforderlich.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await applyFlatHotspotCoords({ slug, hotspotId, x, y })
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
