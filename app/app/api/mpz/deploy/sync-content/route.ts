import { NextResponse, type NextRequest } from 'next/server'
import {
  MpzDeployContentError,
  runDeployContent,
  type DeployContentMode,
} from '@/lib/mpz-deploy-content'
import { MpzDeployRunnerError, truncateDeployOutput } from '@/lib/mpz-deploy-runner'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const runtime = 'nodejs'

function isDeployContentMode(value: unknown): value is DeployContentMode {
  return value === 'media-only' || value === 'full'
}

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

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'mode (media-only|full) ist erforderlich.' },
      { status: 400 },
    )
  }

  const record = body as { mode?: unknown; prune?: unknown }
  if (!isDeployContentMode(record.mode)) {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'mode muss media-only oder full sein.' },
      { status: 400 },
    )
  }

  const prune = record.prune === true

  try {
    const result = await runDeployContent({ mode: record.mode, prune })
    return NextResponse.json({
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: truncateDeployOutput(result.stdout),
      stderr: truncateDeployOutput(result.stderr),
      mode: result.mode,
    })
  } catch (err) {
    if (err instanceof MpzDeployContentError) {
      return NextResponse.json({ error: 'VALIDATION', message: err.message }, { status: 422 })
    }
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
