import { describe, expect, it } from 'vitest'
import { dialogTailSide, resolveDialogTail } from '@/lib/dialog-display'
import type { DialogSegment } from '@/lib/types'

function segment(
  overrides: Partial<DialogSegment> & Pick<DialogSegment, 'rolle'>,
): DialogSegment {
  return {
    id: 's1',
    quelle: '/api/dialog/test.wav',
    text: 'Test',
    ...overrides,
  }
}

describe('resolveDialogTail', () => {
  it('leitet Schwanz aus rolle ab ohne tail-Override', () => {
    expect(resolveDialogTail(segment({ rolle: 'frieda' }))).toBe('left')
    expect(resolveDialogTail(segment({ rolle: 'otto' }))).toBe('right')
    expect(resolveDialogTail(segment({ rolle: 'beide' }))).toBe('center')
  })

  it('nutzt segment.tail als Override', () => {
    expect(
      resolveDialogTail(segment({ rolle: 'beide', tail: 'left' })),
    ).toBe('left')
    expect(
      resolveDialogTail(segment({ rolle: 'frieda', tail: 'center' })),
    ).toBe('center')
  })
})

describe('dialogTailSide', () => {
  it('mappt Rollen auf Schwanzseite', () => {
    expect(dialogTailSide('frieda')).toBe('left')
    expect(dialogTailSide('otto')).toBe('right')
    expect(dialogTailSide('beide')).toBe('center')
  })
})
