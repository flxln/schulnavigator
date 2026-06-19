import { NextResponse, type NextRequest } from 'next/server'
import {
  extractQrManifestFromStdout,
  MpzDeployRunnerError,
  runNpmScript,
  truncateDeployOutput,
} from '@/lib/mpz-deploy-runner'
import { MpzEnvLocalError, requireDeployBaseUrl } from '@/lib/mpz-env-local'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'

export const runtime = 'nodejs'

type QrPreset = 'all' | 'schulfest'

function parseBody(body: unknown): { dryRun: boolean; preset: QrPreset } | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const record = body as Record<string, unknown>
  const dryRun = record.dryRun === true
  const presetRaw = record.preset
  if (presetRaw === undefined) {
    return { dryRun, preset: 'all' }
  }
  if (presetRaw === 'all' || presetRaw === 'schulfest') {
    return { dryRun, preset: presetRaw }
  }
  return null
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

  const parsed = parseBody(body)
  if (!parsed) {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'preset muss all oder schulfest sein.' },
      { status: 400 },
    )
  }

  try {
    requireDeployBaseUrl()
  } catch (err) {
    if (err instanceof MpzEnvLocalError) {
      return NextResponse.json({ error: 'VALIDATION', message: err.message }, { status: 422 })
    }
    throw err
  }

  const args: string[] = []
  if (parsed.dryRun) {
    args.push('--dry-run')
  }
  if (parsed.preset === 'schulfest') {
    args.push('--preset=schulfest')
  }

  try {
    const result = await runNpmScript('generate:qr', args)
    const response: Record<string, unknown> = {
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: truncateDeployOutput(result.stdout),
      stderr: truncateDeployOutput(result.stderr),
      dryRun: parsed.dryRun,
      preset: parsed.preset,
    }
    if (parsed.dryRun) {
      response.manifest = extractQrManifestFromStdout(result.stdout)
    }
    return NextResponse.json(response)
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
