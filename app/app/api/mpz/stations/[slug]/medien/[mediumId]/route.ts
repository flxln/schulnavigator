import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationMedienError,
  removeStationMedium,
} from '@/lib/mpz-station-medien'

export const runtime = 'nodejs'

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '', mediumId = '' } = await context!.params
  try {
    const result = await removeStationMedium(slug, mediumId)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationMedienError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'internal', message: 'Unerwarteter Fehler beim Entfernen des Mediums.' },
      { status: 500 },
    )
  }
})
