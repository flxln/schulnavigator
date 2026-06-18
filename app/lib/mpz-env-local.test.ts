import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DEPLOY_BASE_URL_KEY,
  DEPLOY_EMBED_KEY,
  MpzEnvLocalError,
  patchDeployEnv,
  readDeployEnv,
  validateBaseUrl,
} from '@/lib/mpz-env-local'

const temps: string[] = []

function makeAppRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mpz-env-'))
  temps.push(dir)
  writeFileSync(
    join(dir, '.env.example'),
    `# example\n${DEPLOY_BASE_URL_KEY}=https://example.test\n${DEPLOY_EMBED_KEY}=true\n`,
    'utf8',
  )
  return dir
}

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('validateBaseUrl', () => {
  it('akzeptiert https-URLs', () => {
    expect(validateBaseUrl('https://schulnavigator.mpz.schule')).toBe(
      'https://schulnavigator.mpz.schule',
    )
    expect(validateBaseUrl('https://schulnavigator.mpz.schule/')).toBe(
      'https://schulnavigator.mpz.schule',
    )
  })

  it('lehnt http ab', () => {
    expect(() => validateBaseUrl('http://example.com')).toThrow(MpzEnvLocalError)
    try {
      validateBaseUrl('http://example.com')
    } catch (err) {
      expect(err).toBeInstanceOf(MpzEnvLocalError)
      expect((err as MpzEnvLocalError).code).toBe('VALIDATION')
    }
  })

  it('lehnt leere Werte ab', () => {
    expect(() => validateBaseUrl('   ')).toThrow(MpzEnvLocalError)
  })
})

describe('patchDeployEnv', () => {
  it('erhält Kommentare und upsertet Keys', async () => {
    const appRoot = makeAppRoot()
    writeFileSync(
      join(appRoot, '.env.local'),
      `# Mein Secret bleibt\nSN_MPZ_STUDIO_SECRET=abc\n# URL\n${DEPLOY_BASE_URL_KEY}=https://alt.test\n`,
      'utf8',
    )

    await patchDeployEnv(
      { baseUrl: 'https://neu.test', embedEnabled: false },
      appRoot,
    )

    const text = readFileSync(join(appRoot, '.env.local'), 'utf8')
    expect(text).toContain('# Mein Secret bleibt')
    expect(text).toContain('SN_MPZ_STUDIO_SECRET=abc')
    expect(text).toContain(`${DEPLOY_BASE_URL_KEY}=https://neu.test`)
    expect(text).toContain(`${DEPLOY_EMBED_KEY}=false`)

    const env = readDeployEnv(appRoot)
    expect(env.baseUrl).toBe('https://neu.test')
    expect(env.embedEnabled).toBe(false)
  })

  it('legt .env.local aus .env.example an wenn fehlend', async () => {
    const appRoot = makeAppRoot()
    expect(existsSync(join(appRoot, '.env.local'))).toBe(false)

    await patchDeployEnv({ embedEnabled: true }, appRoot)

    expect(existsSync(join(appRoot, '.env.local'))).toBe(true)
    expect(readDeployEnv(appRoot).embedEnabled).toBe(true)
  })

  it('wirft bei leerem Patch', async () => {
    const appRoot = makeAppRoot()
    await expect(patchDeployEnv({}, appRoot)).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })
})
