import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET, PUT, parsePutBody } from './route'

const BASE = 'http://localhost:3000/api/mpz/hub-config'
const SECRET = 'test-studio-secret'

const sampleBundle = {
  slugMap: {
    klassenzimmer: { slotId: 'portal', nr: 1 },
  },
  accents: {
    klassenzimmer: '#1f6abb',
  },
  icons: {
    klassenzimmer: { type: 'lucide' as const, name: 'GraduationCap' },
  },
}

vi.mock('@/lib/mpz-hub-config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-hub-config')>()
  return { ...actual, replaceHubConfig: vi.fn() }
})

vi.mock('@/lib/mpz-content-io', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-content-io')>()
  return {
    ...actual,
    createMpzContentIo: vi.fn(() => ({
      readHubConfig: vi.fn().mockResolvedValue({
        slugMap: { mappings: sampleBundle.slugMap },
        accents: { accents: sampleBundle.accents },
        icons: { icons: sampleBundle.icons },
      }),
    })),
  }
})

import { replaceHubConfig } from '@/lib/mpz-hub-config'

describe('parsePutBody', () => {
  it('parst gültigen Body', () => {
    const parsed = parsePutBody(sampleBundle)
    expect(parsed?.slugMap.mappings.klassenzimmer).toEqual({ slotId: 'portal', nr: 1 })
  })

  it('lehnt ungültigen Body ab', () => {
    expect(parsePutBody({ slugMap: 'x', accents: {}, icons: {} })).toBeNull()
    expect(parsePutBody(null)).toBeNull()
  })
})

describe('GET /api/mpz/hub-config', () => {
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

describe('PUT /api/mpz/hub-config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(replaceHubConfig).mockReset()
  })

  it('speichert Hub-Config', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(replaceHubConfig).mockResolvedValue({
      slugMap: sampleBundle.slugMap,
      accents: sampleBundle.accents,
      icons: sampleBundle.icons,
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await PUT(
      new NextRequest(new URL(BASE), {
        method: 'PUT',
        headers: {
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(sampleBundle),
      }),
    )

    expect(res.status).toBe(200)
    expect(replaceHubConfig).toHaveBeenCalled()
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
        body: JSON.stringify({ slugMap: null }),
      }),
    )

    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('INVALID_BODY')
  })
})
