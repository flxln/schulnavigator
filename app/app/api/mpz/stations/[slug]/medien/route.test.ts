import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST, parseCreate } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/hort/medien'
const SECRET = 'test-studio-secret'

function postRequest(
  body: unknown,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const routeContext = { params: Promise.resolve({ slug: 'hort' }) }

vi.mock('@/lib/mpz-station-medien', () => ({
  addStationMedium: vi.fn(),
  MpzStationMedienError: class MpzStationMedienError extends Error {
    readonly code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

import { addStationMedium, MpzStationMedienError } from '@/lib/mpz-station-medien'

describe('parseCreate', () => {
  it('akzeptiert link mit Pflichtfeldern', () => {
    expect(
      parseCreate({ typ: 'link', quelle: 'https://example.com' }),
    ).toEqual({ typ: 'link', quelle: 'https://example.com' })
  })

  it('lehnt fehlende quelle ab', () => {
    expect(parseCreate({ typ: 'link' })).toBeNull()
  })

  it('lehnt falschen openIn-Typ (Zahl) ab', () => {
    expect(
      parseCreate({ typ: 'link', quelle: 'https://example.com', openIn: 1 }),
    ).toBeNull()
  })

  it('akzeptiert openIn mit ungültigem Wert — Wert-Prüfung ist Domain-Aufgabe', () => {
    // 'internal' ist kein gültiger Wert, aber ein String → parseCreate nimmt ihn durch;
    // die Domain wirft dann INVALID_OPEN_IN (422).
    const result = parseCreate({ typ: 'link', quelle: 'https://example.com', openIn: 'internal' })
    expect(result).not.toBeNull()
    expect(result?.openIn).toBe('internal')
  })
})

describe('POST /api/mpz/stations/[slug]/medien', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(addStationMedium).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(
      postRequest({ typ: 'link', quelle: 'https://example.com' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('invalid_json → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const req = new NextRequest(new URL(BASE), {
      method: 'POST',
      headers: {
        cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        'content-type': 'application/json',
      },
      body: 'not-json',
    })
    const res = await POST(req, routeContext)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('invalid_json')
  })

  it('invalid_body → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(postRequest({ typ: 'link' }, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('invalid_body')
  })

  it('INVALID_TYP → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationMedium).mockRejectedValue(
      new MpzStationMedienError('INVALID_TYP', 'nur link oder embed'),
    )
    const res = await POST(
      postRequest({ typ: 'audio', quelle: 'https://example.com' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('INVALID_TYP')
  })

  it('INVALID_QUELLE → 422', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationMedium).mockRejectedValue(
      new MpzStationMedienError('INVALID_QUELLE', 'URL ungültig'),
    )
    const res = await POST(
      postRequest({ typ: 'embed', quelle: 'https://evil.example.com' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('INVALID_QUELLE')
  })

  it('Erfolg → 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addStationMedium).mockResolvedValue({
      station: { slug: 'hort', titel: 'Hort', medien: [] },
      mtime: '2026-01-01T00:00:00.000Z',
    })
    const res = await POST(
      postRequest({ typ: 'link', quelle: 'https://bookcreator.com/x' }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(200)
  })
})
