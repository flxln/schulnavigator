import { NextResponse } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { listBrandManifest } from '@/lib/mpz-brand-ingest'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async () => {
  try {
    const manifest = await listBrandManifest()
    return NextResponse.json(manifest)
  } catch {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Manifest konnte nicht geladen werden.' },
      { status: 500 },
    )
  }
})
