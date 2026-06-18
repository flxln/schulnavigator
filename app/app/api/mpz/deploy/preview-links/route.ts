import { NextResponse } from 'next/server'
import { buildDeployPreviewLinks } from '@/lib/mpz-deploy-preview'
import { MpzEnvLocalError } from '@/lib/mpz-env-local'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async () => {
  try {
    const links = buildDeployPreviewLinks()
    return NextResponse.json(links)
  } catch (err) {
    if (err instanceof MpzEnvLocalError && err.code === 'VALIDATION') {
      return NextResponse.json({ error: 'VALIDATION', message: err.message }, { status: 422 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
})
