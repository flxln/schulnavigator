import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  assertImmutableCoachPatch,
  mapCoachError,
  MpzCoachMessagesError,
  patchCoachMessage,
  removeCoachMessage,
  type PatchCoachMessageInput,
} from '@/lib/mpz-coach-messages'
import type { CoachMascot, CoachMode, CoachPlacement } from '@/lib/types'

export const runtime = 'nodejs'

function isMascot(value: unknown): value is CoachMascot {
  return value === 'frieda' || value === 'otto' || value === 'duo'
}

function isPlacement(value: unknown): value is CoachPlacement {
  return (
    value === 'bottom' ||
    value === 'left' ||
    value === 'right' ||
    value === 'duo-split'
  )
}

function isMode(value: unknown): value is CoachMode {
  return value === 'fest' || value === 'heft'
}

export function parsePatch(body: unknown): PatchCoachMessageInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  const patch: PatchCoachMessageInput = {}

  if ('mascot' in raw) {
    if (!isMascot(raw.mascot)) return null
    patch.mascot = raw.mascot
  }
  if ('placement' in raw) {
    if (!isPlacement(raw.placement)) return null
    patch.placement = raw.placement
  }
  if ('text' in raw) {
    if (typeof raw.text !== 'string') return null
    patch.text = raw.text
  }
  if ('milestone' in raw) {
    if (typeof raw.milestone !== 'number') return null
    patch.milestone = raw.milestone
  }
  if ('slug' in raw) {
    if (typeof raw.slug !== 'string' || !raw.slug.trim()) return null
    patch.slug = raw.slug.trim()
  }
  if ('modes' in raw) {
    if (raw.modes === null) {
      patch.modes = null
    } else if (Array.isArray(raw.modes)) {
      if (raw.modes.length === 0) return null
      const modes: CoachMode[] = []
      for (const mode of raw.modes) {
        if (!isMode(mode)) return null
        modes.push(mode)
      }
      patch.modes = modes
    } else {
      return null
    }
  }

  if (Object.keys(patch).length === 0) {
    return null
  }
  return patch
}

export const PATCH = withMpzStudioAccess(async (req: NextRequest, context) => {
  const { messageId = '' } = await context!.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Body muss ein JSON-Objekt sein.' },
      { status: 400 },
    )
  }

  try {
    assertImmutableCoachPatch(body as Record<string, unknown>)
  } catch (err) {
    if (err instanceof MpzCoachMessagesError) {
      const mapped = mapCoachError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    throw err
  }

  const patch = parsePatch(body)
  if (!patch) {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: 'Keine gültigen Felder zum Aktualisieren.' },
      { status: 400 },
    )
  }

  try {
    const result = await patchCoachMessage(messageId, patch)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzCoachMessagesError) {
      const mapped = mapCoachError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Aktualisieren der Coach-Message.' },
      { status: 500 },
    )
  }
})

export const DELETE = withMpzStudioAccess(async (_req: NextRequest, context) => {
  const { messageId = '' } = await context!.params

  try {
    const result = await removeCoachMessage(messageId)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzCoachMessagesError) {
      const mapped = mapCoachError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Löschen der Coach-Message.' },
      { status: 500 },
    )
  }
})
