import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  addDialogGruppe,
  MpzStationDialogError,
  type AddDialogGruppeInput,
} from '@/lib/mpz-station-dialog'
import { mapDialogError } from '@/lib/mpz-station-dialog'

export const runtime = 'nodejs'

export function parseCreate(body: unknown): AddDialogGruppeInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (typeof raw.id !== 'string' || !raw.id.trim()) {
    return null
  }
  if (typeof raw.text !== 'string') {
    return null
  }
  return { id: raw.id.trim(), text: raw.text }
}

export const POST = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Ungültiger JSON-Body.' },
      { status: 400 },
    )
  }

  const input = parseCreate(body)
  if (!input) {
    return NextResponse.json(
      { error: 'MISSING_FIELDS', message: 'Felder "id" und "text" sind erforderlich.' },
      { status: 400 },
    )
  }

  try {
    const result = await addDialogGruppe(slug, input)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzStationDialogError) {
      const mapped = mapDialogError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Anlegen der Gruppe.' },
      { status: 500 },
    )
  }
})
