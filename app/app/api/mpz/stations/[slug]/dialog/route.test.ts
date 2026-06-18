import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { PATCH, parsePatch } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/daz/dialog'
const SECRET = 'test-studio-secret'

const routeContext = { params: Promise.resolve({ slug: 'daz' }) }

function patchRequest(body: unknown, opts?: { cookie?: string }): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  })
}

vi.mock('@/lib/mpz-station-dialog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-station-dialog')>()
  return {
    ...actual,
    patchDialogMeta: vi.fn(),
  }
})

import { MpzStationDialogError, patchDialogMeta } from '@/lib/mpz-station-dialog'

describe('parsePatch dialog meta', () => {
  it('parst figuren', () => {
    expect(parsePatch({ figuren: ['frieda', 'otto'] })).toEqual({
      figuren: ['frieda', 'otto'],
    })
  })

  it('lehnt leeren Body ab', () => {
    expect(parsePatch({})).toBeNull()
  })
})

describe('PATCH /api/mpz/stations/[slug]/dialog', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(patchDialogMeta).mockReset()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(
      patchRequest({ figuren: ['frieda'] }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(patchRequest({ figuren: ['frieda'] }), routeContext)
    expect(res.status).toBe(401)
  })

  it('mappt FIGURE_IN_USE → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchDialogMeta).mockRejectedValue(
      new MpzStationDialogError('FIGURE_IN_USE', 'in use'),
    )
    const res = await PATCH(
      patchRequest({ figuren: ['frieda'] }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'FIGURE_IN_USE' })
  })
})
