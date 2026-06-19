import { NextResponse, type NextRequest } from 'next/server'
import { HUB_SLOTS } from '@/lib/hub-slot-definitions'
import { listAssignableSlotIds } from '@/lib/mpz-hub-config-validation'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { MpzContentIoError } from '@/lib/mpz-content-io'
import {
  mapHubConfigError,
  MpzHubConfigError,
  parsePutBody,
  replaceHubConfig,
} from '@/lib/mpz-hub-config'
import { createMpzContentIo } from '@/lib/mpz-content-io'

export const runtime = 'nodejs'

export { parsePutBody }

export const GET = withMpzStudioAccess(async () => {
  try {
    const io = createMpzContentIo()
    const data = await io.readHubConfig()
    const assignableSlots = listAssignableSlotIds().map((id) => {
      const slot = HUB_SLOTS[id]!
      return {
        id,
        kind: slot.kind,
        frame: slot.frame,
        hitFrame: slot.hitFrame ?? slot.frame,
        rotation: slot.rotation,
      }
    })

    return NextResponse.json({
      slugMap: data.slugMap.mappings,
      accents: data.accents.accents,
      icons: data.icons.icons,
      assignableSlots,
    })
  } catch (err) {
    if (err instanceof MpzContentIoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Hub-Config konnte nicht gelesen werden.' },
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

  const bundle = parsePutBody(body)
  if (!bundle) {
    return NextResponse.json(
      {
        error: 'INVALID_BODY',
        message:
          'Body muss slugMap, accents und icons als Objekte enthalten (icons: type lucide + name).',
      },
      { status: 400 },
    )
  }

  try {
    const result = await replaceHubConfig(bundle)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof MpzHubConfigError) {
      const mapped = mapHubConfigError(err)
      return NextResponse.json(mapped.body, { status: mapped.status })
    }
    if (err instanceof MpzContentIoError) {
      const status = err.code === 'VALIDATION' ? 422 : 500
      return NextResponse.json({ error: err.code, message: err.message }, { status })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Unerwarteter Fehler beim Speichern der Hub-Config.' },
      { status: 500 },
    )
  }
})
