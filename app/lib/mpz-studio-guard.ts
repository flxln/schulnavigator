import { NextResponse, type NextRequest } from 'next/server'

export const MPZ_STUDIO_HEADER = 'x-mpz-studio-key'
export const MPZ_STUDIO_COOKIE = 'sn-mpz-studio'
export const MPZ_STUDIO_UNLOCK_PATH = '/mpz/unlock'
export const MPZ_STUDIO_COOKIE_MAX_AGE = 8 * 60 * 60

export function isMpzStudioEnabled(): boolean {
  return process.env.NODE_ENV === 'development'
}

function getMpzStudioSecret(): string | undefined {
  const secret = process.env.SN_MPZ_STUDIO_SECRET
  return secret && secret.length > 0 ? secret : undefined
}

export function isMpzStudioAuthorized(req: NextRequest): boolean {
  const secret = getMpzStudioSecret()
  if (!secret) {
    return false
  }

  const header = req.headers.get(MPZ_STUDIO_HEADER)
  const cookie = req.cookies.get(MPZ_STUDIO_COOKIE)?.value

  return (
    (header !== null && header === secret) ||
    (cookie !== undefined && cookie === secret)
  )
}

export function assertMpzStudioAccess(req: NextRequest): NextResponse | null {
  if (!isMpzStudioEnabled()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  if (!isMpzStudioAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}

export function mpzStudioPageGuard(req: NextRequest): NextResponse {
  if (!isMpzStudioEnabled()) {
    return new NextResponse(null, { status: 404 })
  }
  if (!isMpzStudioAuthorized(req)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  return NextResponse.next()
}

type MpzStudioRouteHandler = (
  req: NextRequest,
) => NextResponse | Promise<NextResponse>

export function withMpzStudioAccess(handler: MpzStudioRouteHandler): MpzStudioRouteHandler {
  return async (req: NextRequest) => {
    const denied = assertMpzStudioAccess(req)
    if (denied) {
      return denied
    }
    return handler(req)
  }
}

export function setMpzStudioSessionCookie(res: NextResponse, secret: string): void {
  res.cookies.set(MPZ_STUDIO_COOKIE, secret, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: MPZ_STUDIO_COOKIE_MAX_AGE,
  })
}
