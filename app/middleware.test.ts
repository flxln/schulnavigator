import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_COOKIE } from '@/lib/access-tokens'
import { middleware } from './middleware'

const BASE = 'http://localhost:3000'

/** Entspricht ACCESS_PROTECTED_MATCHER in middleware.ts */
function middlewareRunsFor(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/scan' ||
    pathname === '/eintritt' ||
    pathname === '/stationen' ||
    pathname.startsWith('/raum/')
  )
}

function req(path: string, cookie?: string): NextRequest {
  const headers = cookie
    ? { cookie: `${ACCESS_COOKIE}=${cookie}` }
    : undefined
  return new NextRequest(new URL(path, BASE), { headers })
}

describe('middleware', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('leitet ohne Cookie von / nach /eintritt um', () => {
    const res = middleware(req('/'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/eintritt`)
  })

  it('leitet ohne Cookie von /stationen nach /eintritt um', () => {
    const res = middleware(req('/stationen'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/eintritt`)
  })

  it('lässt gültiges Cookie auf / durch', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    const res = middleware(req('/', 'fest-2026'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('setzt Cookie bei gültigem ?t= und leitet nach / um', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    const res = middleware(req('/eintritt?t=fest-2026'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/`)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=fest-2026`)
    expect(setCookie).toContain('HttpOnly')
  })

  it('lehnt ungültiges ?t= ab ohne Cookie', () => {
    const res = middleware(req('/eintritt?t=quatsch'))
    expect(res.headers.get('location')).toBe(`${BASE}/eintritt?reason=invalid`)
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('lässt /eintritt ohne ?t= durch', () => {
    const res = middleware(req('/eintritt'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('leitet abgelaufenes Cookie mit reason=expired um', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-01'))
    const res = middleware(req('/', 'fest-2026'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/eintritt?reason=expired`)
  })

  it('lässt öffentliche Medien ohne Zugangs-Cookie durch', () => {
    expect(middlewareRunsFor('/stations/klassenzimmer.jpg')).toBe(false)
    expect(middlewareRunsFor('/demo/foto.jpg')).toBe(false)
    expect(middlewareRunsFor('/qr/raum-pc-raum.png')).toBe(false)
    expect(middlewareRunsFor('/')).toBe(true)
    expect(middlewareRunsFor('/raum/pc-raum')).toBe(true)

    const res = middleware(req('/stations/klassenzimmer.jpg'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })
})
