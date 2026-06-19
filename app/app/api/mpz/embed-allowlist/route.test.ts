import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET, PUT, parsePutBody } from './route'

const BASE = 'http://localhost:3000/api/mpz/embed-allowlist'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-embed-allowlist', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-embed-allowlist')>()
  return { ...actual, replaceEmbedAllowlist: vi.fn() }
})

vi.mock('@/lib/mpz-content-io', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-content-io')>()
  return {
    ...actual,
    createMpzContentIo: vi.fn(() => ({
      readEmbedAllowlist: vi.fn().mockResolvedValue({
        suffixes: ['delightex.com', 'bookcreator.com'],
      }),
    })),
  }
})

import { replaceEmbedAllowlist } from '@/lib/mpz-embed-allowlist'

describe('parsePutBody', () => {
  it('parst gültigen Body', () => {
    expect(parsePutBody({ suffixes: ['delightex.com'] })).toEqual(['delightex.com'])
  })

  it('lehnt ungültigen Body ab', () => {
    expect(parsePutBody({ suffixes: 'x' })).toBeNull()
    expect(parsePutBody(null)).toBeNull()
  })
})

describe('GET /api/mpz/embed-allowlist', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('liefert 401 ohne Secret', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(new NextRequest(new URL(BASE)))
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/mpz/embed-allowlist', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(replaceEmbedAllowlist).mockReset()
  })

  it('speichert Allowlist', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(replaceEmbedAllowlist).mockResolvedValue({
      suffixes: ['delightex.com'],
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await PUT(
      new NextRequest(new URL(BASE), {
        method: 'PUT',
        headers: {
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ suffixes: ['delightex.com'] }),
      }),
    )

    expect(res.status).toBe(200)
    expect(replaceEmbedAllowlist).toHaveBeenCalledWith(['delightex.com'])
  })

  it('liefert 400 bei ungültigem Body', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)

    const res = await PUT(
      new NextRequest(new URL(BASE), {
        method: 'PUT',
        headers: {
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ suffixes: 'invalid' }),
      }),
    )

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('INVALID_BODY')
  })
})
