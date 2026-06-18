import { NextResponse, type NextRequest } from 'next/server'
import {
  extractCoolifyJsonFromStdout,
  MpzDeployRunnerError,
  runNpmScript,
  truncateDeployOutput,
} from '@/lib/mpz-deploy-runner'
import { MpzEnvLocalError, requireDeployBaseUrl } from '@/lib/mpz-env-local'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const runtime = 'nodejs'

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Body muss gültiges JSON sein.' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object' || typeof (body as { dryRun?: unknown }).dryRun !== 'boolean') {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'dryRun (boolean) ist erforderlich.' },
      { status: 400 },
    )
  }

  const dryRun = (body as { dryRun: boolean }).dryRun

  if (!dryRun) {
    try {
      requireDeployBaseUrl()
    } catch (err) {
      if (err instanceof MpzEnvLocalError) {
        return NextResponse.json({ error: 'VALIDATION', message: err.message }, { status: 422 })
      }
      throw err
    }
  }

  const args = dryRun ? ['--dry-run'] : []

  try {
    const result = await runNpmScript('rotate:access-tokens', args)
    return NextResponse.json({
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: truncateDeployOutput(result.stdout),
      stderr: truncateDeployOutput(result.stderr),
      dryRun,
      coolifyJson: extractCoolifyJsonFromStdout(result.stdout),
    })
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
