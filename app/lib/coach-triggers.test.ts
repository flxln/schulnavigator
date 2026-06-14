import { describe, expect, it } from 'vitest'
import { EMPTY_COACH_SEEN_STATE } from '@/lib/coach-seen'
import {
  isHubCompleteCoachId,
  resolveHubCoachMessage,
  resolveRoomCoachMessage,
} from '@/lib/coach-triggers'

const empty = EMPTY_COACH_SEEN_STATE

describe('resolveHubCoachMessage', () => {
  it('liefert welcome-hub bei 0 besucht', () => {
    const result = resolveHubCoachMessage(0, 12, 'heft', empty)
    expect(result?.message.id).toBe('welcome-hub')
  })

  it('liefert höchste Marke bei Schwellwert (Sprung über halfway)', () => {
    const state = {
      version: 1 as const,
      seen: ['welcome-hub', 'first-visit'],
      suppressed: [],
    }
    const result = resolveHubCoachMessage(7, 12, 'heft', state)
    expect(result?.message.id).toBe('halfway')
  })

  it('liefert hub-complete bei allen Stationen', () => {
    const state = {
      version: 1 as const,
      seen: ['welcome-hub', 'first-visit', 'halfway'],
      suppressed: [],
    }
    const result = resolveHubCoachMessage(12, 12, 'heft', state)
    expect(result?.message.id).toBe('complete')
    expect(result?.message.trigger).toBe('hub-complete')
    expect(result?.supersededIds).toEqual([])
  })

  it('supersededIds für niedrigere Meilensteine beim Gewinner', () => {
    const result = resolveHubCoachMessage(6, 12, 'heft', empty)
    expect(result?.message.id).toBe('halfway')
    expect(result?.supersededIds).toContain('welcome-hub')
    expect(result?.supersededIds).toContain('first-visit')
  })

  it('liefert null wenn alles gesehen', () => {
    const state = {
      version: 1 as const,
      seen: ['welcome-hub', 'first-visit', 'halfway', 'complete'],
      suppressed: [],
    }
    expect(resolveHubCoachMessage(12, 12, 'heft', state)).toBeNull()
  })
})

describe('resolveRoomCoachMessage', () => {
  it('liefert room-first für konfigurierten slug', () => {
    const result = resolveRoomCoachMessage('musik', 'fest', empty)
    expect(result?.message.id).toBe('room-first-musik')
  })

  it('liefert null für unbekannten slug', () => {
    expect(resolveRoomCoachMessage('daz', 'fest', empty)).toBeNull()
  })

  it('liefert null wenn bereits gesehen', () => {
    const state = {
      version: 1 as const,
      seen: ['room-first-hort'],
      suppressed: [],
    }
    expect(resolveRoomCoachMessage('hort', 'heft', state)).toBeNull()
  })
})

describe('isHubCompleteCoachId', () => {
  it('erkennt complete', () => {
    expect(isHubCompleteCoachId('complete')).toBe(true)
    expect(isHubCompleteCoachId('welcome-hub')).toBe(false)
  })
})
