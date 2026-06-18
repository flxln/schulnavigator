import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MPZ_STUDIO_COOKIE } from '@/lib/mpz-studio-guard'
import { POST } from './route'

const BASE = 'http://localhost:3000/api/mpz/deploy/rotate-tokens'
const SECRET = 'test-studio-secret'

vi.mock('@/lib/mpz-deploy-runner', () => ({
  runNpmScript: vi.fn(),
  truncateDeployOutput: (s: string) => s,
  extractCoolifyJsonFromStdout: vi.fn(() => '[{"token":"fest-x"}]'),
  MpzDeployRunnerError: class MpzDeployRunnerError extends Error {
    readonly code = 'SPAWN'
  },
}))

import { runNpmScript } from '@/lib/mpz-deploy-runner'

function post(body: object, cookie?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) {
    headers.cookie = `${MPZ_STUDIO_COOKIE}=${cookie}`
  }
  return new NextRequest(new URL(BASE), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/mpz/deploy/rotate-tokens', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.mocked(runNpmScript).mockReset()
  })

  it('dry-run ruft Skript mit --dry-run auf', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SN_MPZ_STUDIO_SECRET', SECRET)
    vi.mocked(runNpmScript).mockResolvedValue({
      exitCode: 0,
      stdout: 'SN_ACCESS_TOKENS:\n[]',
      stderr: '',
    })
    const res = await POST(post({ dryRun: true }, SECRET))
    expect(res.status).toBe(200)
    expect(runNpmScript).toHaveBeenCalledWith('rotate:access-tokens', ['--dry-run'])
    const json = await res.json()
    expect(json.coolifyJson).toBe('[{"token":"fest-x"}]')
  })
})
