import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { GET, POST, parseCreate } from './route'

const BASE = 'http://localhost:3000/api/mpz/coach/messages'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-coach-messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-coach-messages')>()
  return { ...actual, addCoachMessage: vi.fn() }
})

vi.mock('@/lib/mpz-content-io', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/mpz-content-io')>()
  return {
    ...actual,
    createMpzContentIo: vi.fn(() => ({
      readCoachMessages: vi.fn().mockResolvedValue({ messages: [] }),
    })),
  }
})

import { addCoachMessage } from '@/lib/mpz-coach-messages'

describe('parseCreate coach message', () => {
  it('parst hub-milestone', () => {
    expect(
      parseCreate({
        id: 'test',
        trigger: 'hub-milestone',
        milestone: 1,
        mascot: 'frieda',
        placement: 'left',
        text: 'Hi',
      }),
    ).toEqual({
      id: 'test',
      trigger: 'hub-milestone',
      milestone: 1,
      mascot: 'frieda',
      placement: 'left',
      text: 'Hi',
    })
  })

  it('lehnt fehlende Pflichtfelder ab', () => {
    expect(parseCreate({ id: 'x', trigger: 'hub-complete' })).toBeNull()
  })
})

describe('GET /api/mpz/coach/messages', () => {
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

describe('POST /api/mpz/coach/messages', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(addCoachMessage).mockReset()
  })

  it('legt Message an', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addCoachMessage).mockResolvedValue({
      messages: [],
      mtime: '2026-01-01T00:00:00.000Z',
    })

    const res = await POST(
      new NextRequest(new URL(BASE), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        },
        body: JSON.stringify({
          id: 'new-msg',
          trigger: 'hub-milestone',
          milestone: 2,
          mascot: 'otto',
          placement: 'right',
          text: 'Neu',
        }),
      }),
    )
    expect(res.status).toBe(200)
  })

  it('liefert 422 bei Domain-Fehler', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(addCoachMessage).mockRejectedValue(
      Object.assign(new Error('dup'), {
        name: 'MpzCoachMessagesError',
        code: 'DUPLICATE_ID',
      }),
    )
    const { MpzCoachMessagesError } = await import('@/lib/mpz-coach-messages')
    vi.mocked(addCoachMessage).mockRejectedValue(
      new MpzCoachMessagesError('DUPLICATE_ID', 'dup'),
    )

    const res = await POST(
      new NextRequest(new URL(BASE), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `${MPZ_STUDIO_COOKIE}=${SECRET}`,
        },
        body: JSON.stringify({
          id: 'welcome-hub',
          trigger: 'hub-milestone',
          milestone: 0,
          mascot: 'frieda',
          placement: 'left',
          text: 'Dup',
        }),
      }),
    )
    expect(res.status).toBe(422)
    const json = (await res.json()) as { error: string }
    expect(json.error).toBe('DUPLICATE_ID')
  })
})
