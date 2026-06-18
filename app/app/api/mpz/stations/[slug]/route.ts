import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationStammdatenError,
  readStationStammdaten,
} from '@/lib/mpz-station-stammdaten'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  try {
    const station = await readStationStammdaten(slug)
    return NextResponse.json({ station }, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationStammdatenError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'IO' ? 500 : 422
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Lesen der Station.' },
      { status: 500 },
    )
  }
})
