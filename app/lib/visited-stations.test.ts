import { describe, expect, it } from 'vitest'
import {
  addVisitedSlug,
  countVisited,
  parseVisitedSlugs,
} from '@/lib/visited-stations'

const VALID = new Set(['musik', 'hort', 'abc'])

describe('parseVisitedSlugs', () => {
  it('liefert leeres Array bei null oder leerem String', () => {
    expect(parseVisitedSlugs(null, VALID)).toEqual([])
    expect(parseVisitedSlugs('', VALID)).toEqual([])
  })

  it('filtert ungültige und doppelte Slugs', () => {
    expect(
      parseVisitedSlugs(
        JSON.stringify(['musik', 'unknown', 'musik', 'hort']),
        VALID,
      ),
    ).toEqual(['musik', 'hort'])
  })

  it('liefert leeres Array bei ungültigem JSON', () => {
    expect(parseVisitedSlugs('not-json', VALID)).toEqual([])
    expect(parseVisitedSlugs('{"x":1}', VALID)).toEqual([])
  })
})

describe('addVisitedSlug', () => {
  it('fügt gültigen Slug hinzu', () => {
    expect(addVisitedSlug([], 'musik', VALID)).toEqual(['musik'])
  })

  it('ist idempotent', () => {
    const once = addVisitedSlug([], 'musik', VALID)
    expect(addVisitedSlug(once, 'musik', VALID)).toBe(once)
  })

  it('ignoriert ungültigen Slug', () => {
    expect(addVisitedSlug(['musik'], 'unknown', VALID)).toEqual(['musik'])
  })
})

describe('countVisited', () => {
  it('zählt nur gültige Slugs', () => {
    expect(countVisited(['musik', 'unknown', 'hort'], VALID)).toBe(2)
  })
})
