import { NextResponse } from 'next/server'
import { withMpzStudioAccess } from '@/lib/mpz-studio-guard'
import { createMpzContentIo, MpzContentIoError } from '@/lib/mpz-content-io'
import { auditCoachAudio } from '@/lib/mpz-coach-audio-ingest'

export const runtime = 'nodejs'

export const GET = withMpzStudioAccess(async () => {
  try {
    const io = createMpzContentIo()
    const data = await io.readCoachMessages()
    const { appRoot } = io.getPaths()
    const audit = auditCoachAudio(data.messages, appRoot)
    const missingCount = audit.entries.filter((e) => e.state === 'leer').length
    const driftCount = audit.entries.filter((e) => e.state === 'drift').length
    return NextResponse.json({
      ...audit,
      missingCount,
      driftCount,
    })
  } catch (err) {
    if (err instanceof MpzContentIoError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Coach-Audio-Status konnte nicht geladen werden.' },
      { status: 500 },
    )
  }
})
