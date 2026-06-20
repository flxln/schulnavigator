import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUBBLE_FONT_SIZE,
  DEFAULT_BUBBLE_MARGIN_Y_REM,
  DEFAULT_BUBBLE_MAX_WIDTH_REM,
  DEFAULT_DUO_BUBBLE_MARGIN_Y_REM,
  DEFAULT_MASCOT_SIZE,
  resolveCoachLayout,
  validateCoachLayoutFields,
} from '@/lib/coach-layout'
import type { CoachMessage } from '@/lib/types'

function baseMessage(
  placement: CoachMessage['placement'] = 'left',
): Pick<CoachMessage, 'placement' | 'layout'> {
  return { placement }
}

describe('resolveCoachLayout', () => {
  it('liefert Defaults ohne layout', () => {
    const resolved = resolveCoachLayout(baseMessage('left'))
    expect(resolved.imgStyle).toEqual({
      height: `min(${DEFAULT_MASCOT_SIZE * 100}vh, 260px)`,
    })
    expect(resolved.figureStyle).toBeUndefined()
    expect(resolved.duoRowStyle).toBeUndefined()
    expect(resolved.bubbleStyle).toEqual({
      marginTop: `${DEFAULT_BUBBLE_MARGIN_Y_REM}rem`,
      maxWidth: `min(100%, ${DEFAULT_BUBBLE_MAX_WIDTH_REM}rem)`,
      fontSize: `${DEFAULT_BUBBLE_FONT_SIZE}px`,
    })
  })

  it('wendet Overrides an', () => {
    const resolved = resolveCoachLayout({
      placement: 'left',
      layout: {
        mascotSize: 0.38,
        bubbleOffsetY: -0.25,
        bubbleFontSize: 16,
        bubbleOffsetX: 1,
      },
    })
    expect(resolved.imgStyle.height).toBe('min(38vh, 260px)')
    expect(resolved.bubbleStyle.marginTop).toBe(
      `${DEFAULT_BUBBLE_MARGIN_Y_REM - 0.25}rem`,
    )
    expect(resolved.bubbleStyle.fontSize).toBe('16px')
    expect(resolved.bubbleStyle.marginLeft).toBe('1rem')
  })

  it('clampt Werte an Grenzen (Defense-in-Depth)', () => {
    const resolved = resolveCoachLayout({
      placement: 'left',
      layout: { mascotSize: 0.99, bubbleMaxWidth: 40 },
    })
    expect(resolved.imgStyle.height).toBe('min(55vh, 260px)')
    expect(resolved.bubbleStyle.maxWidth).toBe('min(100%, 32rem)')
  })

  it('duo-split: Default bubble margin -0.5rem und Offsets auf Duo-Row', () => {
    const resolved = resolveCoachLayout({
      placement: 'duo-split',
      layout: { mascotOffsetX: 1, mascotOffsetY: 0.5 },
    })
    expect(resolved.duoRowStyle).toEqual({
      transform: 'translate(1rem, 0.5rem)',
    })
    expect(resolved.figureStyle).toBeUndefined()
    expect(resolved.bubbleStyle.marginTop).toBe(
      `${DEFAULT_DUO_BUBBLE_MARGIN_Y_REM}rem`,
    )
  })

  it('spiegelt Figur horizontal und vertikal', () => {
    const resolved = resolveCoachLayout({
      placement: 'left',
      layout: { mascotFlipX: true, mascotFlipY: true },
    })
    expect(resolved.figureStyle).toEqual({
      transform: 'scale(-1, -1)',
    })
  })

  it('duo-split: Spiegelung auf beiden Figuren', () => {
    const resolved = resolveCoachLayout({
      placement: 'duo-split',
      layout: { mascotFlipX: true },
    })
    expect(resolved.figureStyle).toEqual({ transform: 'scale(-1, 1)' })
    expect(resolved.duoRowStyle).toBeUndefined()
  })
})

describe('validateCoachLayoutFields', () => {
  it('akzeptiert fehlendes layout und leeres Objekt', () => {
    expect(validateCoachLayoutFields(undefined, 'messages[0]')).toEqual([])
    expect(validateCoachLayoutFields({}, 'messages[0]')).toEqual([])
  })

  it('meldet unbekannte Keys und Clamps', () => {
    const errors = validateCoachLayoutFields(
      { mascotSize: 0.99, foo: 1, bubbleMaxWidth: 40 },
      'messages[0]',
    )
    expect(errors).toContain('messages[0]: unbekanntes layout-Feld "foo"')
    expect(errors).toContain('messages[0]: layout.mascotSize außerhalb 0.15–0.55')
    expect(errors).toContain('messages[0]: layout.bubbleMaxWidth außerhalb 12–32')
  })

  it('meldet ungültige Flip-Felder', () => {
    const errors = validateCoachLayoutFields(
      { mascotFlipX: 'yes' },
      'messages[0]',
    )
    expect(errors).toContain('messages[0]: layout.mascotFlipX muss boolean sein')
  })
})
