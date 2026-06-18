import { NextResponse } from 'next/server'
import { runDeployValidateAll } from '@/lib/mpz-deploy-validate-all'
import { MpzDeployRunnerError } from '@/lib/mpz-deploy-runner'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const runtime = 'nodejs'

export const POST = withMpzStudioAccess(async () => {
  try {
    const result = await runDeployValidateAll()
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof MpzDeployRunnerError) {
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: err.message },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
})
