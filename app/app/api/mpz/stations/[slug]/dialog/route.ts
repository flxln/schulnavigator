import { NextResponse, type NextRequest } from 'next/server'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import {
  createDialog,
  MpzStationDialogError,
  mapDialogError,
  patchDialogMeta,
  removeDialog,
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

function mapContentIoError(err: MpzContentIoError): { status: number; body: { error: string; message: string } } {
  const error = err.code === 'VALIDATION' ? 'VALIDATION_FAILED' : err.code
  const status = err.code === 'VALIDATION' ? 422 : 500
  return { status, body: { error, message: err.message } }
}

function handleDialogRouteError(err: unknown, fallbackMessage: string): NextResponse {
  if (err instanceof MpzStationDialogError) {
    const mapped = mapDialogError(err)
    return NextResponse.json(mapped.body, { status: mapped.status })
  }
  if (err instanceof MpzContentIoError) {
    const mapped = mapContentIoError(err)
    return NextResponse.json(mapped.body, { status: mapped.status })
  }
  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: fallbackMessage },
    { status: 500 },
  )
}

export const POST = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  try {
    const result = await createDialog(slug)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    return handleDialogRouteError(err, 'Unerwarteter Fehler beim Anlegen des Dialogs.')
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { slug = '' } = await context!.params
  try {
    const result = await removeDialog(slug)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    return handleDialogRouteError(err, 'Unerwarteter Fehler beim Entfernen des Dialogs.')
  }
})

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
    return handleDialogRouteError(err, 'Unerwarteter Fehler beim Bearbeiten des Dialogs.')
  }
})
