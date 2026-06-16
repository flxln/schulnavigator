import { NextRequest, NextResponse } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MPZ_STUDIO_COOKIE,
  MPZ_STUDIO_HEADER,
  assertMpzStudioAccess,
  isMpzStudioAuthorized,
  withMpzStudioAccess,
} from './mpz-studio-guard'

const BASE = 'http://localhost:3000'
const SECRET = 'test-studio-secret'

function req(
  path: string,
  opts?: { header?: string; cookie?: string },
): NextRequest {
  const headers: Record<string, string> = {}
  if (opts?.header !== undefined) {
    headers[MPZ_STUDIO_HEADER] = opts.header
  }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(path, BASE), { headers })
}

describe('mpz-studio-guard', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('assertMpzStudioAccess: production → 404 auch mit gültigem Header', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const denied = assertMpzStudioAccess(req('/api/mpz/health', { header: SECRET }))
    expect(denied?.status).toBe(404)
  })

  it('assertMpzStudioAccess: NODE_ENV=test → 404', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = assertMpzStudioAccess(req('/api/mpz/health', { header: SECRET }))
    expect(res?.status).toBe(404)
  })

  it('assertMpzStudioAccess: development ohne Secret → 401', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', '')
    const res = assertMpzStudioAccess(req('/api/mpz/health'))
    expect(res?.status).toBe(401)
  })

  it('assertMpzStudioAccess: development ohne Header/Cookie → 401', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = assertMpzStudioAccess(req('/api/mpz/health'))
    expect(res?.status).toBe(401)
  })

  it('assertMpzStudioAccess: gültiger Header → ok', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    expect(assertMpzStudioAccess(req('/api/mpz/health', { header: SECRET }))).toBeNull()
  })

  it('assertMpzStudioAccess: gültiges Cookie → ok', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    expect(
      assertMpzStudioAccess(req('/api/mpz/health', { cookie: SECRET })),
    ).toBeNull()
  })

  it('falscher Header + gültiges Cookie → ok (kein ||-Kurzschluss)', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    expect(
      assertMpzStudioAccess(
        req('/api/mpz/health', { header: 'wrong', cookie: SECRET }),
      ),
    ).toBeNull()
  })

  it('falscher Header ohne Cookie → 401', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = assertMpzStudioAccess(req('/api/mpz/health', { header: 'wrong' }))
    expect(res?.status).toBe(401)
  })

  it('withMpzStudioAccess: blockiert ohne Auth', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const GET = withMpzStudioAccess(() => NextResponse.json({ ok: true }))
    const res = await GET(req('/api/mpz/health'))
    expect(res.status).toBe(401)
  })

  it('withMpzStudioAccess: ruft Handler bei gültigem Header auf', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const GET = withMpzStudioAccess(() => NextResponse.json({ ok: true }))
    const res = await GET(req('/api/mpz/health', { header: SECRET }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
  })
})
