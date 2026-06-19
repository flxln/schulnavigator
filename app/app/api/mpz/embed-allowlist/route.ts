import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  mapEmbedAllowlistError,
  MpzEmbedAllowlistError,
  parsePutBody,
  replaceEmbedAllowlist,
} from '@/lib/mpz-embed-allowlist'
import { createMpzContentIo } from '@/lib/mpz-content-io'

export const runtime = 'nodejs'

export { parsePutBody }

export const GET = withMpzStudioAccess(async () => {
  try {
    const io = createMpzContentIo()
    const data = await io.readEmbedAllowlist()
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof MpzContentIoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Embed-Allowlist konnte nicht gelesen werden.' },
      { status: 500 },
    )
  }
})

export const PUT = withMpzStudioAccess(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const suffixes = parsePutBody(body)
  if (!suffixes) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message: 'Body muss ein Objekt mit suffixes (string[]) sein.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await replaceEmbedAllowlist(suffixes)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzEmbedAllowlistError) {
      const mapped = mapEmbedAllowlistError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Speichern der Allowlist.' },
      { status: 500 },
    )
  }
})
