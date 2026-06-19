import { NextResponse } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { listStationHotspotIcons } from '@/lib/mpz-hotspot-icon-ingest'
import { MpzUploadError } from '@/lib/mpz-upload-rules'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async (_req, context) => {
  const { slug = '' } = await context!.params

  try {
    const result = await listStationHotspotIcons(slug)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof MpzUploadError && err.code === 'VALIDATION') {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Laden der Icons.' },
      { status: 500 },
    )
  }
})
