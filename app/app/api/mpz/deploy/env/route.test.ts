import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET, PATCH } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/env'
const SECRET = 'test-studio-secret'

function request(
  method: 'GET' | 'PATCH',
  body?: object,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = {}
  if (body) {
    headers['content-type'] = 'application/json'
  }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

vi.mock('@/lib/mpz-env-local', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-env-local')>()
  return {
    ...actual,
    readDeployEnv: vi.fn(),
    patchDeployEnv: vi.fn(),
  }
})

import { patchDeployEnv, readDeployEnv } from '@/lib/mpz-env-local'

describe('/api/mpz/deploy/env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(readDeployEnv).mockReset()
    vi.mocked(patchDeployEnv).mockReset()
  })

  it('GET production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await GET(request('GET', undefined, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('PATCH ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(request('PATCH', { embedEnabled: true }))
    expect(res.status).toBe(401)
  })

  it('PATCH leerer Body → 400 INVALID_BODY', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(request('PATCH', {}, { cookie: SECRET }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('INVALID_BODY')
  })

  it('GET liefert Env-Werte', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(readDeployEnv).mockReturnValue({
      baseUrl: 'https://schulnavigator.mpz.schule',
      embedEnabled: true,
    })
    const res = await GET(request('GET', undefined, { cookie: SECRET }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      baseUrl: 'https://schulnavigator.mpz.schule',
      embedEnabled: true,
    })
  })
})
