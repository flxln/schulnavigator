import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetAccessConfigCacheForTests } from '@/lib/access-config'
import {
  ACCESS_COOKIE,
  FEST_DEV_TOKEN,
  HEFT_DEV_TOKEN,
  resetAccessTokensCacheForTests,
} from '@/lib/access-tokens'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { middleware, ACCESS_PROTECTED_MATCHER } from './middleware'

const BASE = 'http://localhost:3000'
const MPZ_SECRET = 'mpz-test-secret'

/** Gespiegelte Matcher-Logik — muss mit ACCESS_PROTECTED_MATCHER und config.matcher übereinstimmen. */
function middlewareRunsFor(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/scan' ||
    pathname === '/eintritt' ||
    pathname.startsWith('/eintritt/') ||
    pathname === '/stationen' ||
    pathname.startsWith('/raum/') ||
    pathname === '/mpz' ||
    pathname.startsWith('/mpz/')
  )
}

function req(path: string, cookie?: string): NextRequest {
  const headers = cookie ? { cookie } : undefined
  return new NextRequest(new URL(path, BASE), { headers })
}

describe('middleware', () => {
  const envSnapshot = { ...process.env }

  afterEach(() => {
    vi.useRealTimers()
    process.env = { ...envSnapshot }
    resetAccessConfigCacheForTests()
    resetAccessTokensCacheForTests()
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
    const res = middleware(req('/', `${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
  })

  it('setzt Cookie bei gültigem ?t= und leitet nach / um', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    const res = middleware(req(`/eintritt?t=${FEST_DEV_TOKEN}`))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/`)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`)
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
    const res = middleware(req('/', `${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`))
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
    const res = middleware(req(`/eintritt/scan?t=${FEST_DEV_TOKEN}`))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(`${BASE}/`)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`)
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
    expect(setCookie).toContain(`${ACCESS_COOKIE}=${HEFT_DEV_TOKEN}`)
  })

  it('DEV_UNLOCK_ALL: hebt fest-Cookie auf Heft an', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01'))
    process.env.DEV_UNLOCK_ALL = 'true'
    process.env.NODE_ENV = 'development'

    const res = middleware(req('/', `${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`))
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${ACCESS_COOKIE}=${HEFT_DEV_TOKEN}`)
  })

  describe('MPZ Studio (/mpz/*)', () => {
    beforeEach(() => {
      vi.stubEnv('SN_MPZ_STUDIO_SECRET', MPZ_SECRET)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('/mpz/studio in production → 404', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const res = middleware(req('/mpz/studio'))
      expect(res.status).toBe(404)
    })

    it('/mpz in production → 404 (kein /eintritt-Redirect)', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const res = middleware(req('/mpz'))
      expect(res.status).toBe(404)
      expect(res.headers.get('location')).toBeNull()
    })

    it('/mpz/studio in development ohne Auth → 401', () => {
      vi.stubEnv('NODE_ENV', 'development')
      const res = middleware(req('/mpz/studio'))
      expect(res.status).toBe(401)
    })

    it('/mpz/studio in development mit Studio-Cookie → durch', () => {
      vi.stubEnv('NODE_ENV', 'development')
      const res = middleware(req('/mpz/studio', `${MPZ_STUDIO_COOKIE}=${MPZ_SECRET}`))
      expect(res.status).toBe(200)
    })
  })

  it('Drift-Guard: middlewareRunsFor deckt ACCESS_PROTECTED_MATCHER ab', () => {
    const staticRoutes = ACCESS_PROTECTED_MATCHER.filter((p) => !p.includes(':'))
    for (const route of staticRoutes) {
      expect(middlewareRunsFor(route)).toBe(true)
    }
    expect(middlewareRunsFor('/raum/pc-raum')).toBe(true)
    expect(middlewareRunsFor('/eintritt/scan')).toBe(true)
    expect(middlewareRunsFor('/mpz')).toBe(true)
    expect(middlewareRunsFor('/mpz/studio')).toBe(true)
  })

  describe('SN_ACCESS_MODE=open', () => {
    beforeEach(() => {
      process.env.SN_ACCESS_MODE = 'open'
      resetAccessConfigCacheForTests()
    })

    it('lässt / ohne Cookie durch', () => {
      const res = middleware(req('/'))
      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })

    it('lässt /stationen ohne Cookie durch', () => {
      const res = middleware(req('/stationen'))
      expect(res.status).toBe(200)
    })

    it('lässt /raum/pc-raum ohne Cookie durch', () => {
      const res = middleware(req('/raum/pc-raum'))
      expect(res.status).toBe(200)
    })

    it('setzt fest-Cookie bei gültigem ?t= und leitet um', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-06-01'))
      const res = middleware(req(`/?t=${FEST_DEV_TOKEN}`))
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe(`${BASE}/`)
      const setCookie = res.headers.get('set-cookie') ?? ''
      expect(setCookie).toContain(`${ACCESS_COOKIE}=${FEST_DEV_TOKEN}`)
    })

    it('lässt ungültiges ?t= ohne Redirect durch', () => {
      const res = middleware(req('/?t=quatsch'))
      expect(res.status).toBe(200)
      expect(res.headers.get('location')).toBeNull()
    })
  })
})
