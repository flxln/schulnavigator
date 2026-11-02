import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE, PATCH, POST, parsePatch } from './route'

const BASE = 'http://localhost:3000/api/mpz/stations/daz/dialog'
const SECRET = 'test-studio-secret'

const routeContext = { params: Promise.resolve({ slug: 'daz' }) }

function dialogRequest(
  method: 'PATCH' | 'POST' | 'DELETE',
  body?: unknown,
  opts?: { cookie?: string },
): NextRequest {
  const headers: Record<string, string> = {}
  if (method === 'PATCH') {
    headers['content-type'] = 'application/json'
  }
  if (opts?.cookie !== undefined) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${opts.cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

vi.mock('@/lib/mpz-station-dialog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-station-dialog')>()
  return {
    ...actual,
    patchDialogMeta: vi.fn(),
    createDialog: vi.fn(),
    removeDialog: vi.fn(),
  }
})

import {
  createDialog,
  MpzStationDialogError,
  patchDialogMeta,
  removeDialog,
} from '@/lib/mpz-station-dialog'

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
      dialogRequest('PATCH', { figuren: ['frieda'] }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(404)
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await PATCH(dialogRequest('PATCH', { figuren: ['frieda'] }), routeContext)
    expect(res.status).toBe(401)
  })

  it('mappt FIGURE_IN_USE → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchDialogMeta).mockRejectedValue(
      new MpzStationDialogError('FIGURE_IN_USE', 'in use'),
    )
    const res = await PATCH(
      dialogRequest('PATCH', { figuren: ['frieda'] }, { cookie: SECRET }),
      routeContext,
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'FIGURE_IN_USE' })
  })
})

describe('POST /api/mpz/stations/[slug]/dialog', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(createDialog).mockReset()
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await POST(dialogRequest('POST'), routeContext)
    expect(res.status).toBe(401)
  })

  it('legt Dialog an → 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(createDialog).mockResolvedValue({
      station: { slug: 'klassenzimmer', titel: 'Klassenzimmer', dialog: { figuren: ['frieda', 'otto'], segmente: [], gruppen: [] } },
      mtime: '2026-01-01T00:00:00.000Z',
    })
    const res = await POST(dialogRequest('POST', undefined, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    expect(vi.mocked(createDialog)).toHaveBeenCalledWith('daz')
  })

  it('mappt DIALOG_EXISTS → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(createDialog).mockRejectedValue(
      new MpzStationDialogError('DIALOG_EXISTS', 'existiert'),
    )
    const res = await POST(dialogRequest('POST', undefined, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'DIALOG_EXISTS' })
  })
})

describe('DELETE /api/mpz/stations/[slug]/dialog', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(removeDialog).mockReset()
  })

  it('development ohne Cookie → 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    const res = await DELETE(dialogRequest('DELETE'), routeContext)
    expect(res.status).toBe(401)
  })

  it('entfernt Dialog → 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeDialog).mockResolvedValue({
      station: { slug: 'klassenzimmer', titel: 'Klassenzimmer' },
      mtime: '2026-01-01T00:00:00.000Z',
    })
    const res = await DELETE(dialogRequest('DELETE', undefined, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(200)
    expect(vi.mocked(removeDialog)).toHaveBeenCalledWith('daz')
  })

  it('mappt DIALOG_IN_USE → 400', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeDialog).mockRejectedValue(
      new MpzStationDialogError('DIALOG_IN_USE', 'hotspots'),
    )
    const res = await DELETE(dialogRequest('DELETE', undefined, { cookie: SECRET }), routeContext)
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: 'DIALOG_IN_USE' })
  })
})
