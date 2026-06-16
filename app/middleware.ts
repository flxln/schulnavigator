import { NextResponse, type NextRequest } from 'next/server'
import { isAccessGated } from '@/lib/access-config'
import {
  ACCESS_COOKIE,
  getAccessTokens,
  maxAgeSeconds,
  validateToken,
  type AccessToken,
} from '@/lib/access-tokens'
import { DEV_UNLOCK_HEFT_TOKEN, isDevUnlockAll } from '@/lib/dev-unlock'
import { mpzStudioPageGuard } from '@/lib/mpz-studio-guard'

const IS_PROD = process.env.NODE_ENV === 'production'

function setAccessCookie(res: NextResponse, entry: AccessToken): void {
  res.cookies.set(ACCESS_COOKIE, entry.token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds(entry.expiresAt),
  })
}

function devUnlockResponse(): NextResponse | null {
  if (!isDevUnlockAll()) {
    return null
  }
  const heft = validateToken(DEV_UNLOCK_HEFT_TOKEN)
  if (!heft) {
    return null
  }
  const res = NextResponse.next()
  setAccessCookie(res, heft)
  return res
}

function isPublicAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/stations/') ||
    pathname.startsWith('/demo/') ||
    pathname.startsWith('/qr/') ||
    pathname.startsWith('/brand/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/api/health'
  )
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  if (url.pathname === '/mpz' || url.pathname.startsWith('/mpz/')) {
    return mpzStudioPageGuard(req)
  }

  if (isPublicAssetPath(url.pathname)) {
    return NextResponse.next()
  }

  const t = url.searchParams.get('t')

  // Explizite Whitelist — kein startsWith, damit /eintritt/foo nicht versehentlich cookie-frei wird.
  const EINTRITT_BYPASS = ['/eintritt', '/eintritt/scan'] as const
  if (EINTRITT_BYPASS.some((p) => p === url.pathname) && t === null) {
    return NextResponse.next()
  }

  if (t !== null) {
    const valid = validateToken(t)
    if (valid) {
      const dest = new URL(url)
      dest.searchParams.delete('t')
      dest.pathname = '/'
      const res = NextResponse.redirect(dest)
      setAccessCookie(res, valid)
      return res
    }
    if (isAccessGated()) {
      return redirectToHint(url, 'invalid')
    }
  }

  if (!isAccessGated()) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get(ACCESS_COOKIE)?.value
  const validCookie = validateToken(cookie)
  if (validCookie) {
    if (isDevUnlockAll() && validCookie.mode === 'fest') {
      return devUnlockResponse()
    }
    return NextResponse.next()
  }

  const devUnlock = devUnlockResponse()
  if (devUnlock) {
    return devUnlock
  }

  const wasKnown =
    !!cookie && getAccessTokens().some((x) => x.token === cookie)
  return redirectToHint(url, wasKnown ? 'expired' : undefined)
}

function redirectToHint(url: URL, reason?: 'invalid' | 'expired') {
  const hint = new URL(url)
  hint.pathname = '/eintritt'
  hint.search = reason ? `?reason=${reason}` : ''
  return NextResponse.redirect(hint)
}

/** Nur App-Routen — öffentliche Assets unter /stations, /demo, /qr usw. bleiben außerhalb der Middleware. */
export const ACCESS_PROTECTED_MATCHER = [
  '/',
  '/raum/:path*',
  '/scan',
  '/eintritt',
  '/eintritt/:path*',
  '/stationen',
  '/mpz',
  '/mpz/:path*',
] as const

// Next.js erfordert statisch parsebare matcher-Literale (kein Spread aus Konstante).
export const config = {
  matcher: [
    '/',
    '/raum/:path*',
    '/scan',
    '/eintritt',
    '/eintritt/:path*',
    '/stationen',
    '/mpz',
    '/mpz/:path*',
  ],
}
