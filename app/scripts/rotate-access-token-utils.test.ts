import { describe, expect, it } from 'vitest'
import {
  buildAccessTokensPayload,
  generateEntryToken,
  parseRotateArgs,
  renderAccessTokenConstants,
  resolveRotationTargets,
} from '../scripts/rotate-access-token-utils.mjs'

const CURRENT = {
  FEST_DEV_TOKEN: 'fest-oldToken123',
  HEFT_DEV_TOKEN: 'heft-oldToken456',
  FEST_DEV_EXPIRES_AT: '2026-07-31',
  HEFT_DEV_EXPIRES_AT: '2027-07-31',
}

function fixedRandom(_size: number): Buffer {
  return Buffer.from('abcdefghijklmnop', 'utf8')
}

describe('generateEntryToken', () => {
  it('erzeugt fest- Präfix mit base64url-Suffix', () => {
    const token = generateEntryToken('fest', fixedRandom, 12)
    expect(token).toMatch(/^fest-[A-Za-z0-9_-]+$/)
    expect(token.startsWith('fest-')).toBe(true)
  })

  it('wirft bei ungültiger entropy', () => {
    expect(() => generateEntryToken('heft', fixedRandom, 4)).toThrow(
      /--entropy-bytes/,
    )
  })
})

describe('renderAccessTokenConstants', () => {
  it('schreibt gültiges Modul mit ENTRY_QR_SPECS', () => {
    const src = renderAccessTokenConstants({
      fest: 'fest-newABC',
      heft: 'heft-newXYZ',
      festExpires: '2026-08-01',
      heftExpires: '2027-08-01',
    })
    expect(src).toContain("export const FEST_DEV_TOKEN = 'fest-newABC'")
    expect(src).toContain("export const HEFT_DEV_TOKEN = 'heft-newXYZ'")
    expect(src).toContain('entry-fest.png')
    expect(src).toContain('entry-heft.png')
  })

  it('lehnt ungültiges Datum ab', () => {
    expect(() =>
      renderAccessTokenConstants({
        fest: 'fest-x',
        heft: 'heft-y',
        festExpires: '31-07-2026',
        heftExpires: '2027-07-31',
      }),
    ).toThrow(/festExpires/)
  })
})

describe('parseRotateArgs', () => {
  it('parst Flags', () => {
    const opts = parseRotateArgs([
      '--dry-run',
      '--fest-only',
      '--no-qr',
      '--fest-expires=2026-09-01',
      '--entropy-bytes=16',
    ])
    expect(opts.dryRun).toBe(true)
    expect(opts.festOnly).toBe(true)
    expect(opts.noQr).toBe(true)
    expect(opts.festExpires).toBe('2026-09-01')
    expect(opts.entropyBytes).toBe(16)
  })

  it('lehnt widersprüchliche Flags ab', () => {
    expect(() => parseRotateArgs(['--fest-only', '--heft-only'])).toThrow()
  })
})

describe('resolveRotationTargets', () => {
  it('rotiert beide Tokens standardmäßig', () => {
    const targets = resolveRotationTargets(
      parseRotateArgs([]),
      CURRENT,
      (mode) => `${mode}-generated`,
    )
    expect(targets.fest).toBe('fest-generated')
    expect(targets.heft).toBe('heft-generated')
    expect(targets.festExpires).toBe('2026-07-31')
  })

  it('behält heft bei --fest-only', () => {
    const targets = resolveRotationTargets(
      parseRotateArgs(['--fest-only']),
      CURRENT,
      (mode) => `${mode}-new`,
    )
    expect(targets.fest).toBe('fest-new')
    expect(targets.heft).toBe(CURRENT.HEFT_DEV_TOKEN)
  })
})

describe('buildAccessTokensPayload', () => {
  it('liefert SN_ACCESS_TOKENS-Format', () => {
    const payload = buildAccessTokensPayload({
      fest: 'fest-a',
      heft: 'heft-b',
      festExpires: '2026-07-31',
      heftExpires: '2027-07-31',
    })
    expect(payload).toEqual([
      { token: 'fest-a', mode: 'fest', expiresAt: '2026-07-31' },
      { token: 'heft-b', mode: 'heft', expiresAt: '2027-07-31' },
    ])
  })
})
