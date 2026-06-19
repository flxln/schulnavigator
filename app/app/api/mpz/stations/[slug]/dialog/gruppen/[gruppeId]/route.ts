import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationDialogError,
  patchDialogGruppe,
  removeDialogGruppe,
  type PatchDialogGruppeInput,
} from '@/lib/mpz-station-dialog'
import { mapDialogError } from '@/lib/mpz-station-dialog'

export const runtime = 'nodejs'

export function parsePatch(body: unknown): PatchDialogGruppeInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (!Object.hasOwn(raw, 'text') || typeof raw.text !== 'string') {
    return null
  }
  return { text: raw.text }
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', gruppeId = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Ungültiger JSON-Body.' },
      { status: 400 },
    )
  }

  const patch = parsePatch(body)
  if (!patch) {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Body muss gültiges Feld "text" enthalten.' },
      { status: 400 },
    )
  }

  try {
    const result = await patchDialogGruppe(slug, gruppeId, patch)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Bearbeiten der Gruppe.' },
      { status: 500 },
    )
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '', gruppeId = '' } = await context!.params
  try {
    const result = await removeDialogGruppe(slug, gruppeId)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Entfernen der Gruppe.' },
      { status: 500 },
    )
  }
})
