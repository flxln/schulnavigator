import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  FEST_DEV_TOKEN,
  HEFT_DEV_TOKEN,
} from '@/lib/access-token-constants.mjs'
import { buildDeployPreviewLinks } from '@/lib/mpz-deploy-preview'
import { DEPLOY_BASE_URL_KEY } from '@/lib/mpz-env-local'

const temps: string[] = []

function makeAppRoot(baseUrl: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'mpz-preview-'))
  temps.push(dir)
  writeFileSync(
    join(dir, '.env.local'),
    `${DEPLOY_BASE_URL_KEY}=${baseUrl}\n`,
    'utf8',
  )
  return dir
}

afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('buildDeployPreviewLinks', () => {
  it('baut Hub-, Entry- und Raum-URLs', () => {
    const appRoot = makeAppRoot('https://schulnavigator.mpz.schule')
    const links = buildDeployPreviewLinks(appRoot)

    expect(links.hubUrl).toBe('https://schulnavigator.mpz.schule/')
    expect(links.entryFestUrl).toBe(
      `https://schulnavigator.mpz.schule/eintritt?t=${encodeURIComponent(FEST_DEV_TOKEN)}`,
    )
    expect(links.entryHeftUrl).toBe(
      `https://schulnavigator.mpz.schule/eintritt?t=${encodeURIComponent(HEFT_DEV_TOKEN)}`,
    )
    expect(links.rooms).toHaveLength(12)
    expect(links.rooms[0]?.slug).toBe('klassenzimmer')
    expect(links.rooms[0]?.url).toBe('https://schulnavigator.mpz.schule/raum/klassenzimmer')
  })

  it('wirft ohne BASE_URL', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mpz-preview-empty-'))
    temps.push(dir)
    expect(() => buildDeployPreviewLinks(dir)).toThrow(/NEXT_PUBLIC_BASE_URL/)
  })
})
