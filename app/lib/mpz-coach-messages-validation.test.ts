import { describe, expect, it } from 'vitest'
import { validateCoachMessagesContent } from '@/lib/mpz-coach-messages-validation'
import type { CoachMessagesFile } from '@/lib/types'

const stationSlugs = new Set(['klassenzimmer', 'musik'])
const stationCount = 2

function validFile(): CoachMessagesFile {
  return {
    messages: [
      {
        id: 'complete',
        trigger: 'hub-complete',
        mascot: 'duo',
        placement: 'duo-split',
        text: 'Fertig',
      },
      {
        id: 'm0',
        trigger: 'hub-milestone',
        milestone: 0,
        mascot: 'frieda',
        placement: 'left',
        text: 'Hi',
      },
    ],
  }
}

describe('validateCoachMessagesContent', () => {
  it('akzeptiert gültige Datei', () => {
    expect(validateCoachMessagesContent(validFile(), stationCount, stationSlugs)).toEqual(
      [],
    )
  })

  it('meldet fehlende hub-complete', () => {
    const errors = validateCoachMessagesContent(
      { messages: validFile().messages.filter((m) => m.trigger !== 'hub-complete') },
      stationCount,
      stationSlugs,
    )
    expect(errors.some((e) => e.includes('hub-complete'))).toBe(true)
  })

  it('meldet milestone außerhalb Bereich', () => {
    const file = validFile()
    file.messages[1] = { ...file.messages[1]!, milestone: 5 }
    const errors = validateCoachMessagesContent(file, stationCount, stationSlugs)
    expect(errors.some((e) => e.includes('außerhalb'))).toBe(true)
  })

  it('meldet ungültiges layout', () => {
    const file = validFile()
    file.messages[1] = {
      ...file.messages[1]!,
      layout: { mascotSize: 0.99 },
    }
    const errors = validateCoachMessagesContent(file, stationCount, stationSlugs)
    expect(errors.some((e) => e.includes('layout.mascotSize außerhalb'))).toBe(true)
  })

  it('akzeptiert gültiges layout', () => {
    const file = validFile()
    file.messages[1] = {
      ...file.messages[1]!,
      layout: { mascotSize: 0.38, bubbleOffsetY: -0.25 },
    }
    expect(validateCoachMessagesContent(file, stationCount, stationSlugs)).toEqual([])
  })

  it('meldet ungültige quelle', () => {
    const file = validFile()
    file.messages[1] = {
      ...file.messages[1]!,
      quelle: '/api/coach/wrong',
    }
    const errors = validateCoachMessagesContent(file, stationCount, stationSlugs)
    expect(errors.some((e) => e.includes('quelle muss'))).toBe(true)
  })

  it('akzeptiert gültige quelle (Format)', () => {
    const file = validFile()
    file.messages[1] = {
      ...file.messages[1]!,
      quelle: '/api/coach/m0',
    }
    expect(validateCoachMessagesContent(file, stationCount, stationSlugs)).toEqual([])
  })
})
