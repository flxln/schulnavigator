import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  MpzStationDialogError,
  mapDialogError,
  patchDialogMeta,
  type DialogMetaPatch,
} from '@/lib/mpz-station-dialog'
import type { DialogBubbleLayout, DialogFigure } from '@/lib/types'

export const runtime = 'nodejs'

function isDialogFigure(value: unknown): value is DialogFigure {
  return value === 'frieda' || value === 'otto'
}

function parseBubble(raw: unknown): DialogBubbleLayout | null | undefined {
  if (raw === null) return null
  if (!raw || typeof raw !== 'object') return undefined
  const patch: DialogBubbleLayout = {}
  const obj = raw as Record<string, unknown>
  if (Object.hasOwn(obj, 'y')) {
    if (typeof obj.y !== 'number' || !Number.isFinite(obj.y)) return undefined
    patch.y = obj.y
  }
  if (Object.hasOwn(obj, 'x')) {
    if (typeof obj.x !== 'number' || !Number.isFinite(obj.x)) return undefined
    patch.x = obj.x
  }
  if (Object.hasOwn(obj, 'maxWidth')) {
    if (typeof obj.maxWidth !== 'number' || !Number.isFinite(obj.maxWidth)) return undefined
    patch.maxWidth = obj.maxWidth
  }
  if (Object.hasOwn(obj, 'fontSize')) {
    if (typeof obj.fontSize !== 'number' || !Number.isFinite(obj.fontSize)) return undefined
    patch.fontSize = obj.fontSize
  }
  if (Object.hasOwn(obj, 'followPan')) {
    if (typeof obj.followPan !== 'boolean') return undefined
    patch.followPan = obj.followPan
  }
  return patch
}

export function parsePatch(body: unknown): DialogMetaPatch | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: DialogMetaPatch = {}

  if (Object.hasOwn(raw, 'figuren')) {
    if (!Array.isArray(raw.figuren) || !raw.figuren.every(isDialogFigure)) {
      return null
    }
    patch.figuren = raw.figuren
  }
  if (Object.hasOwn(raw, 'bubble')) {
    const bubble = parseBubble(raw.bubble)
    if (bubble === undefined) return null
    patch.bubble = bubble
  }

  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

export { mapDialogError }

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
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

  const patch = parsePatch(body)
  if (!patch) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message: 'Body muss mindestens ein gültiges Feld (figuren, bubble) enthalten.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await patchDialogMeta(slug, patch)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Bearbeiten des Dialogs.' },
      { status: 500 },
    )
  }
})
