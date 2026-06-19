import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { DELETE, PATCH, parsePatch } from './route'

const BASE = 'http://localhost:3000/api/mpz/coach/messages/welcome-hub'
const SECRET = 'test-studio-secret'
const routeContext = { params: Promise.resolve({ messageId: 'welcome-hub' }) }

vi.mock('@/lib/mpz-coach-messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-coach-messages')>()
  return {
    ...actual,
    patchCoachMessage: vi.fn(),
    removeCoachMessage: vi.fn(),
  }
})

import { MpzCoachMessagesError, patchCoachMessage, removeCoachMessage } from '@/lib/mpz-coach-messages'

describe('parsePatch coach message', () => {
  it('parst text', () => {
    expect(parsePatch({ text: 'Neu' })).toEqual({ text: 'Neu' })
  })

  it('parst modes null', () => {
    expect(parsePatch({ modes: null })).toEqual({ modes: null })
  })

  it('lehnt leeres modes ab', () => {
    expect(parsePatch({ modes: [] })).toBeNull()
  })
})

describe('PATCH /api/mpz/coach/messages/[messageId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(patchCoachMessage).mockReset()
  })

  it('aktualisiert Message', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(patchCoachMessage).mockResolvedValue({
      messages: [],
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await PATCH(
      new NextRequest(new URL(BASE), {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        },
        body: JSON.stringify({ text: 'Neu' }),
      }),
      routeContext,
    )
    expect(res.status).toBe(200)
  })

  it('liefert 422 bei IMMUTABLE_FIELD', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)

    const res = await PATCH(
      new NextRequest(new URL(BASE), {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        },
        body: JSON.stringify({ trigger: 'room-first' }),
      }),
      routeContext,
    )
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('IMMUTABLE_FIELD')
  })
})

describe('DELETE /api/mpz/coach/messages/[messageId]', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(removeCoachMessage).mockReset()
  })

  it('löscht Message', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeCoachMessage).mockResolvedValue({
      messages: [],
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await DELETE(
      new NextRequest(new URL(BASE), { method: 'DELETE', headers: { cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}` } }),
      routeContext,
    )
    expect(res.status).toBe(200)
  })

  it('liefert 422 bei LAST_HUB_COMPLETE', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(removeCoachMessage).mockRejectedValue(
      new MpzCoachMessagesError('LAST_HUB_COMPLETE', 'letzte'),
    )

    const res = await DELETE(
      new NextRequest(new URL(BASE), { method: 'DELETE', headers: { cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}` } }),
      routeContext,
    )
    expect(res.status).toBe(422)
  })
})
