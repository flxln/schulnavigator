import { describe, expect, it, vi } from 'vitest'
import { runDeployValidateAll } from '@/lib/mpz-deploy-validate-all'

vi.mock('@/lib/mpz-deploy-runner', () => ({
  runNpmScript: vi.fn(),
  truncateDeployOutput: (s: string) => s,
}))

import { runNpmScript } from '@/lib/mpz-deploy-runner'

describe('runDeployValidateAll', () => {
  it('führt alle vier Schritte aus auch nach Fehler', async () => {
    vi.mocked(runNpmScript)
      .mockResolvedValueOnce({ exitCode: 0, stdout: 'a', stderr: '' })
      .mockResolvedValueOnce({ exitCode: 1, stdout: 'b', stderr: 'err' })
      .mockResolvedValueOnce({ exitCode: 0, stdout: 'c', stderr: '' })
      .mockResolvedValueOnce({ exitCode: 0, stdout: 'd', stderr: '' })

    const result = await runDeployValidateAll('/tmp/app')

    expect(runNpmScript).toHaveBeenCalledTimes(4)
    expect(result.steps).toHaveLength(4)
    expect(result.ok).toBe(false)
    expect(result.steps[1]?.exitCode).toBe(1)
    expect(result.steps[3]?.name).toBe('test')
  })
})
