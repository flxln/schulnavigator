import { describe, expect, it } from 'vitest'
import { topBarMirrorWidthClass } from '@/lib/ui/top-bar-layout'

describe('topBarMirrorWidthClass', () => {
  it('uses w-[38px] without leftExtra', () => {
    expect(topBarMirrorWidthClass(false)).toBe('w-[38px]')
  })

  it('uses w-[84px] with leftExtra (back + gap + extra)', () => {
    expect(topBarMirrorWidthClass(true)).toBe('w-[84px]')
  })
})
