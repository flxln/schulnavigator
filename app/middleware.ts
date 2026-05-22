import { NextResponse, type NextRequest } from 'next/server'
import {
  ACCESS_COOKIE,
  ACCESS_TOKENS,
  maxAgeSeconds,
  validateToken,
} from '@/lib/access-tokens'

const IS_PROD = process.env.NODE_ENV === 'production'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
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

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
