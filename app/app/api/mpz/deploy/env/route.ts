import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  MpzEnvLocalError,
  patchDeployEnv,
  readDeployEnv,
} from '@/lib/mpz-env-local'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async () => {
  try {
    const env = readDeployEnv()
    return NextResponse.json({
      baseUrl: env.baseUrl,
      embedEnabled: env.embedEnabled,
    })
  } catch (err) {
    if (err instanceof MpzEnvLocalError && err.code === 'IO') {
      return NextResponse.json({ error: 'IO', message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
})

export const PATCH = withMpzStudioAccess(async (req: NextRequest) => {
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
      { error: 'INVALID_BODY', message: 'Body muss ein JSON-Objekt sein.' },
      { status: 400 },
    )
  }

  const record = body as Record<string, unknown>
  const hasBaseUrl = 'baseUrl' in record
  const hasEmbed = 'embedEnabled' in record

  if (!hasBaseUrl && !hasEmbed) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message: 'Mindestens eines von baseUrl oder embedEnabled ist erforderlich.',
      },
      { status: 400 },
    )
  }

  if (hasBaseUrl && typeof record.baseUrl !== 'string') {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'baseUrl muss ein String sein.' },
      { status: 400 },
    )
  }

  if (hasEmbed && typeof record.embedEnabled !== 'boolean') {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'embedEnabled muss ein Boolean sein.' },
      { status: 400 },
    )
  }

  try {
    const env = await patchDeployEnv({
      baseUrl: hasBaseUrl ? record.baseUrl as string : undefined,
      embedEnabled: hasEmbed ? record.embedEnabled as boolean : undefined,
    })
    return NextResponse.json({
      baseUrl: env.baseUrl,
      embedEnabled: env.embedEnabled,
      restartRequired: true,
    })
  } catch (err) {
    if (err instanceof MpzEnvLocalError) {
      if (err.code === 'VALIDATION') {
        return NextResponse.json({ error: 'VALIDATION', message: err.message }, { status: 422 })
      }
      return NextResponse.json({ error: 'IO', message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 },
    )
  }
})
