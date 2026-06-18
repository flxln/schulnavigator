import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  addDialogSegment,
  MpzStationDialogError,
  type AddDialogSegmentInput,
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

export function parseCreate(body: unknown): AddDialogSegmentInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (!isRolle(raw.rolle)) {
    return null
  }
  const input: AddDialogSegmentInput = { rolle: raw.rolle }
  if (raw.id !== undefined) {
    if (typeof raw.id !== 'string' || !raw.id.trim()) return null
    input.id = raw.id.trim()
  }
  if (raw.text !== undefined) {
    if (typeof raw.text !== 'string') return null
    input.text = raw.text
  }
  if (raw.gruppe !== undefined) {
    if (typeof raw.gruppe !== 'string' || !raw.gruppe.trim()) return null
    input.gruppe = raw.gruppe.trim()
  }
  if (raw.tail !== undefined) {
    if (!isTail(raw.tail)) return null
    input.tail = raw.tail
  }
  return input
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
      { error: 'MISSING_FIELDS', message: 'Pflichtfeld "rolle" fehlt oder ist ungültig.' },
      { status: 400 },
    )
  }

  try {
    const result = await addDialogSegment(slug, input)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Anlegen des Segments.' },
      { status: 500 },
    )
  }
})
