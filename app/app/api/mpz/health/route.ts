import { NextResponse } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const GET = withMpzStudioAccess(() => {
  return NextResponse.json({ status: 'ok', studio: true })
})
