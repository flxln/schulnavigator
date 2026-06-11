import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_COOKIE } from '@/lib/access-tokens'
import { middleware, ACCESS_PROTECTED_MATCHER } from './middleware'

const BASE = 'http://localhost:3000'

/** Gespiegelte Matcher-Logik — muss mit ACCESS_PROTECTED_MATCHER und config.matcher übereinstimmen. */
function middlewareRunsFor(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/scan' ||
    pathname === '/eintritt' ||
    pathname.startsWith('/eintritt/') ||
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
  const envSnapshot = { ...process.env }

  afterEach(() => {
    vi.useRealTimers()
    process.env = { ...envSnapshot }
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

  it('lässt /eintritt/scan ohne Cookie durch', () => {
    const res = middleware(req('/eintritt/scan'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('setzt Cookie bei gültigem ?t= auf /eintritt/scan und leitet nach / um', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    const res = middleware(req('/eintritt/scan?t=fest-2026'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/`)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=fest-2026`)
  })

  it('leitet /eintritt/foo ohne Cookie nach /eintritt um (nicht in Whitelist)', () => {
    const res = middleware(req('/eintritt/foo'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/eintritt`)
  })

  it('DEV_UNLOCK_ALL: setzt Heft-Cookie ohne Zugang', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    process.env.DEV_UNLOCK_ALL = 'true'
    process.env.NODE_ENV = 'development'

    const res = middleware(req('/'))
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=heft-2026-27`)
  })

  it('DEV_UNLOCK_ALL: hebt fest-Cookie auf Heft an', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    process.env.DEV_UNLOCK_ALL = 'true'
    process.env.NODE_ENV = 'development'

    const res = middleware(req('/', 'fest-2026'))
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=heft-2026-27`)
  })

  it('Drift-Guard: middlewareRunsFor deckt ACCESS_PROTECTED_MATCHER ab', () => {
    // Stellt sicher, dass Matcher-Konstante, config.matcher und die gespiegelte
    // Test-Funktion nicht auseinanderlaufen, wenn neue Routen hinzukommen.
    const staticRoutes = ACCESS_PROTECTED_MATCHER.filter((p) => !p.includes(':'))
    for (const route of staticRoutes) {
      expect(middlewareRunsFor(route)).toBe(true)
    }
    // Wildcards manuell mit konkreten Beispielpfaden prüfen
    expect(middlewareRunsFor('/raum/pc-raum')).toBe(true)
    expect(middlewareRunsFor('/eintritt/scan')).toBe(true)
  })
})
