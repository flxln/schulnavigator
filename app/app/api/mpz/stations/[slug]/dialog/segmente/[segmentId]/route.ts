import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationDialogError,
  patchDialogSegment,
  removeDialogSegment,
  type PatchDialogSegmentInput,
} from '@/lib/mpz-station-dialog'
import type { DialogBubbleTail, DialogRolle } from '@/lib/types'
import { mapDialogError } from '@/lib/mpz-station-dialog'

export const runtime = 'nodejs'

function isRolle(value: unknown): value is DialogRolle {
  return value === 'frieda' || value === 'otto' || value === 'beide'
}

function isTail(value: unknown): value is DialogBubbleTail {
  return value === 'left' || value === 'right' || value === 'center'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

export function parsePatch(body: unknown): PatchDialogSegmentInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: PatchDialogSegmentInput = {}

  if (Object.hasOwn(raw, 'text')) {
    if (typeof raw.text !== 'string') return null
    patch.text = raw.text
  }
  if (Object.hasOwn(raw, 'gruppe')) {
    if (!isNullableString(raw.gruppe)) return null
    patch.gruppe = raw.gruppe
  }
  if (Object.hasOwn(raw, 'tail')) {
    if (raw.tail === null || isTail(raw.tail)) {
      patch.tail = raw.tail as DialogBubbleTail | null
    } else {
      return null
    }
  }
  if (Object.hasOwn(raw, 'rolle')) {
    if (!isRolle(raw.rolle)) return null
    patch.rolle = raw.rolle
  }

  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { slug = '', segmentId = '' } = await context!.params
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
      {
        error: 'INVALID_BODY',
        message:
          'Body muss mindestens ein gültiges Feld (text, gruppe, tail, rolle) enthalten.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await patchDialogSegment(slug, segmentId, patch)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Bearbeiten des Segments.' },
      { status: 500 },
    )
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '', segmentId = '' } = await context!.params
  try {
    const result = await removeDialogSegment(slug, segmentId)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Entfernen des Segments.' },
      { status: 500 },
    )
  }
})
