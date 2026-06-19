import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/validate-all'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-deploy-validate-all', () => ({
  runDeployValidateAll: vi.fn(),
}))

import { runDeployValidateAll } from '@/lib/mpz-deploy-validate-all'

function post(cookie?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (cookie) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${cookie}`
  }
  return new NextRequest(new URL(BASE), { method: 'POST', headers })
}

describe('POST /api/mpz/deploy/validate-all', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(runDeployValidateAll).mockReset()
  })

  it('liefert aggregiertes Ergebnis mit HTTP 200', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(runDeployValidateAll).mockResolvedValue({
      ok: false,
      steps: [
        { name: 'validate:coach', exitCode: 1, stdout: 'x', stderr: '' },
      ],
    })
    const res = await POST(post(SECRET))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(json.steps[0]?.name).toBe('validate:coach')
  })
})
