import { NextResponse, type NextRequest } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  addCoachMessage,
  mapCoachError,
  MpzCoachMessagesError,
  type AddCoachMessageInput,
} from '@/lib/mpz-coach-messages'
import { parseCoachLayoutBody } from '@/lib/coach-layout'
import type {
  CoachMascot,
  CoachMode,
  CoachPlacement,
  CoachTrigger,
} from '@/lib/types'
import { createMpzContentIo } from '@/lib/mpz-content-io'

export const runtime = 'nodejs'

function isTrigger(value: unknown): value is CoachTrigger {
  return (
    value === 'hub-milestone' ||
    value === 'hub-complete' ||
    value === 'room-first'
  )
}

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

export function parseCreate(body: unknown): AddCoachMessageInput | null {
  if (!body || typeof body !== 'object') {
    return null
  }
  const raw = body as Record<string, unknown>
  if (
    typeof raw.id !== 'string' ||
    !raw.id.trim() ||
    !isTrigger(raw.trigger) ||
    !isMascot(raw.mascot) ||
    !isPlacement(raw.placement) ||
    typeof raw.text !== 'string'
  ) {
    return null
  }

  const input: AddCoachMessageInput = {
    id: raw.id.trim(),
    trigger: raw.trigger,
    mascot: raw.mascot,
    placement: raw.placement,
    text: raw.text,
  }

  if (raw.milestone !== undefined) {
    if (typeof raw.milestone !== 'number') return null
    input.milestone = raw.milestone
  }
  if (raw.slug !== undefined) {
    if (typeof raw.slug !== 'string' || !raw.slug.trim()) return null
    input.slug = raw.slug.trim()
  }
  if (raw.modes !== undefined) {
    if (!Array.isArray(raw.modes) || raw.modes.length === 0) return null
    const modes: CoachMode[] = []
    for (const mode of raw.modes) {
      if (!isMode(mode)) return null
      modes.push(mode)
    }
    input.modes = modes
  }

  if ('layout' in raw) {
    const layout = parseCoachLayoutBody(raw.layout, false)
    if (layout === undefined && raw.layout !== undefined) {
      return null
    }
    if (layout !== undefined && layout !== null) {
      input.layout = layout
    }
  }

  if (raw.quelle !== undefined) {
    if (typeof raw.quelle !== 'string' || !raw.quelle.startsWith('/')) {
      return null
    }
    input.quelle = raw.quelle
  }

  return input
}

export const GET = withMpzStudioAccess(async () => {
  try {
    const io = createMpzContentIo()
    const data = await io.readCoachMessages()
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof MpzContentIoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Coach-Messages konnten nicht gelesen werden.' },
      { status: 500 },
    )
  }
})

export const POST = withMpzStudioAccess(async (req: NextRequest) => {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Kein gültiges JSON.' },
      { status: 400 },
    )
  }

  const input = parseCreate(body)
  if (!input) {
    return NextResponse.json(
      {
        error: 'MISSING_FIELDS',
        message:
          'Pflichtfelder id, trigger, mascot, placement und text fehlen oder sind ungültig.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await addCoachMessage(input)
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
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Anlegen der Coach-Message.' },
      { status: 500 },
    )
  }
})
