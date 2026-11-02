import { describe, expect, it } from 'vitest'
import { resolveDesignTab } from '@/lib/mpz-studio-design-page'

describe('resolveDesignTab', () => {
  it('gibt hub für fehlenden tab zurück', () => {
    expect(resolveDesignTab(undefined)).toBe('hub')
  })

  it('gibt hub für tab=hub zurück', () => {
    expect(resolveDesignTab('hub')).toBe('hub')
  })

  it('gibt brand für tab=brand zurück', () => {
    expect(resolveDesignTab('brand')).toBe('brand')
  })

  it('gibt hub für ungültigen tab zurück (TAB-01, kein Redirect)', () => {
    expect(resolveDesignTab('quatsch')).toBe('hub')
  })

  it('nutzt erstes Element bei tab-Array', () => {
    expect(resolveDesignTab(['brand', 'hub'])).toBe('brand')
  })
})
