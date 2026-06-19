import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationStammdatenError,
  patchStationStammdaten,
  type StammdatenPatch,
} from '@/lib/mpz-station-stammdaten'
import type { ViewerMode } from '@/lib/types'

export const runtime = 'nodejs'

function isViewerMode(value: unknown): value is ViewerMode {
  return value === 'flat' || value === 'equirectangular'
}

function parsePatch(body: unknown): StammdatenPatch | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: StammdatenPatch = {}
  if ('titel' in raw) {
    if (typeof raw.titel !== 'string') return null
    patch.titel = raw.titel
  }
  if ('beschreibung' in raw) {
    if (typeof raw.beschreibung !== 'string') return null
    patch.beschreibung = raw.beschreibung
  }
  if ('viewer' in raw) {
    if (!isViewerMode(raw.viewer)) return null
    patch.viewer = raw.viewer
  }
  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '' } = await context!.params
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
        { status: 400 },
      )
    }

    const patch = parsePatch(body)
    if (!patch) {
      return NextResponse.json(
        {
          error: 'INVALID_BODY',
          message: 'Body muss mindestens ein gültiges Feld (titel, beschreibung, viewer) enthalten.',
        },
        { status: 400 },
      )
    }

    try {
      const result = await patchStationStammdaten(slug, patch)
      return NextResponse.json(result, { status: 200 })
    } catch (err) {
      if (err instanceof MpzStationStammdatenError) {
        const status =
          err.code === 'NOT_FOUND' ? 404 : err.code === 'NO_FIELDS' ? 400 : 422
        return NextResponse.json({ error: err.code, message: err.message }, { status })
      }
      if (err instanceof MpzContentIoError) {
        const status = err.code === 'VALIDATION' ? 422 : 500
        return NextResponse.json({ error: err.code, message: err.message }, { status })
      }
      return NextResponse.json(
        { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Speichern der Stammdaten.' },
        { status: 500 },
      )
    }
})
