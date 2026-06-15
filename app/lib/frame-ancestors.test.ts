import { describe, expect, it } from 'vitest'
import {
  embedAncestorsToCsp,
  parseEmbedAncestors,
} from '@/lib/frame-ancestors'

describe('parseEmbedAncestors', () => {
  it('liefert leeres Array ohne ENV', () => {
    expect(parseEmbedAncestors(undefined)).toEqual([])
    expect(parseEmbedAncestors('')).toEqual([])
  })

  it('parst kommagetrennte https-Origins', () => {
    expect(
      parseEmbedAncestors(
        'https://Schule.Example.de, https://www.schule.example.de',
      ),
    ).toEqual(['https://schule.example.de', 'https://www.schule.example.de'])
  })

  it('lehnt http ab', () => {
    expect(() => parseEmbedAncestors('http://schule.example.de')).toThrow(
      /ungültiger Origin/,
    )
  })

  it('lehnt Pfade ab', () => {
    expect(() =>
      parseEmbedAncestors('https://schule.example.de/pfad'),
    ).toThrow(/ungültiger Origin/)
  })
})

describe('embedAncestorsToCsp', () => {
  it('defaultet auf none', () => {
    expect(embedAncestorsToCsp([])).toBe("'none'")
  })

  it('serialisiert Origins', () => {
    expect(
      embedAncestorsToCsp([
        'https://a.example.de',
        'https://b.example.de',
      ]),
    ).toBe('https://a.example.de https://b.example.de')
  })
})
