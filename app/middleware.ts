import { NextResponse, type NextRequest } from 'next/server'
import {
  ACCESS_COOKIE,
  ACCESS_TOKENS,
  maxAgeSeconds,
  validateToken,
} from '@/lib/access-tokens'

const IS_PROD = process.env.NODE_ENV === 'production'

function isPublicAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/stations/') ||
    pathname.startsWith('/demo/') ||
    pathname.startsWith('/qr/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/api/health'
  )
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  if (isPublicAssetPath(url.pathname)) {
    return NextResponse.next()
  }

  const t = url.searchParams.get('t')

  if (url.pathname === '/eintritt' && t === null) {
    return NextResponse.next()
  }

  if (t !== null) {
    const valid = validateToken(t)
    if (valid) {
      const dest = new URL(url)
      dest.searchParams.delete('t')
      dest.pathname = '/'
      const res = NextResponse.redirect(dest)
      res.cookies.set(ACCESS_COOKIE, valid.token, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: maxAgeSeconds(valid.expiresAt),
      })
      return res
    }
    return redirectToHint(url, 'invalid')
  }

  const cookie = req.cookies.get(ACCESS_COOKIE)?.value
  if (validateToken(cookie)) {
    return NextResponse.next()
  }

  const wasKnown =
    !!cookie && ACCESS_TOKENS.some((x) => x.token === cookie)
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
] as const

// Next.js erfordert statisch parsebare matcher-Literale (kein Spread aus Konstante).
export const config = {
  matcher: ['/', '/raum/:path*', '/scan', '/eintritt'],
}
