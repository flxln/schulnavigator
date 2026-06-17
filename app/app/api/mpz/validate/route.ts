import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import { runMpzStudioValidation } from '@/lib/mpz-studio-overview'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async () => {
  try {
    const report = await runMpzStudioValidation()
    return NextResponse.json(report)
  } catch (err) {
    if (err instanceof MpzContentIoError) {
      return NextResponse.json(
        { error: 'io', message: err.message },
        { status: 500 },
      )
    }
    return NextResponse.json(
      {
        error: 'validation_failed',
        message: err instanceof Error ? err.message : 'Unbekannter Fehler',
      },
      { status: 500 },
    )
  }
})
