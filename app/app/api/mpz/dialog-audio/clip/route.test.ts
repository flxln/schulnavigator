import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE } from './route'

vi.mock('@/lib/mpz-dialog-audio-ingest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-dialog-audio-ingest')>()
  return {
    ...actual,
    removeDialogClip: vi.fn(),
  }
})

import { MpzUploadError, removeDialogClip } from '@/lib/mpz-dialog-audio-ingest'

const BASE = 'http://localhost:3000/api/mpz/dialog-audio/clip'
const SECRET = 'test-studio-secret'

function deleteRequest(
  params: Record<string, string>,
  opts?: { cookie?: string },
): NextRequest {
  const url = new URL(BASE)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const headers: Record<string, string> = {}
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(url, { method: 'DELETE', headers })
}

describe('DELETE /api/mpz/dialog-audio/clip', () => {
  beforeEach(() => {
    vi.mocked(removeDialogClip).mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('production → 404', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz', segmentIndex: '0' }, { cookie: SECRET }))
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz', segmentIndex: '0' }))
    expect(res.status).toBe(401)
  })

  it('ohne slug → 400 MISSING_SLUG', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(
      new NextRequest(`${BASE}?segmentIndex=0`, {
        method: 'DELETE',
        headers: { cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}` },
      }),
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'MISSING_SLUG' })
  })

  it('ohne segmentIndex → 400 MISSING_FIELDS', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz' }, { cookie: SECRET }))
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'MISSING_FIELDS' })
  })

  it('ungültiger segmentIndex → 422 INVALID_SEGMENT', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz', segmentIndex: 'x' }, { cookie: SECRET }))
    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({ error: 'INVALID_SEGMENT' })
  })

  it('daz Segment 0 → 200 mit Domain-Mock', async () => {
    vi.mocked(removeDialogClip).mockResolvedValue({
      slug: 'daz',
      segmentIndex: 0,
      expectedClip: '01-frieda.wav',
      fileDeleted: true,
    })
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz', segmentIndex: '0' }, { cookie: SECRET }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      slug: 'daz',
      segmentIndex: 0,
      expectedClip: '01-frieda.wav',
      fileDeleted: true,
    })
    expect(removeDialogClip).toHaveBeenCalledWith('daz', 0)
  })

  it('VALIDATION aus Domain → 422', async () => {
    vi.mocked(removeDialogClip).mockRejectedValue(
      new MpzUploadError('VALIDATION', 'segmentIndex 99 außerhalb'),
    )
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(deleteRequest({ slug: 'daz', segmentIndex: '99' }, { cookie: SECRET }))
    expect(res.status).toBe(422)
    await expect(res.json()).resolves.toMatchObject({ error: 'VALIDATION' })
  })
})
