import { describe, expect, it } from 'vitest'
import { copyForInstance } from './instance-profile'

describe('copyForInstance', () => {
  it('nennt die 39. GS nur im Schulprofil', () => {
    expect(copyForInstance(undefined).homeName).toBe('Grundschule Dresden-Plauen')
    expect(copyForInstance('gs39').chipMark).toBe('39.')
    const demo = copyForInstance('demo')
    expect(demo.homeName).toBe('Schulnavigator Demo')
    expect(JSON.stringify(demo)).not.toMatch(/39/)
  })
})
