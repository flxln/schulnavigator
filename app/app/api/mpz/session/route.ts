import { NextRequest, NextResponse } from 'next/server'
import {
  MPZ_STUDIO_HEADER,
  isMpzStudioEnabled,
  setMpzStudioSessionCookie,
} from '@/lib/mpz-studio-guard'

export async function POST(req: NextRequest) {
  if (!isMpzStudioEnabled()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const secret = process.env.SN_MPZ_STUDIO_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const header = req.headers.get(MPZ_STUDIO_HEADER)
  if (header !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  setMpzStudioSessionCookie(res, secret)
  return res
}
