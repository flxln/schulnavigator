import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateCoachMessagesContent } from '@/lib/mpz-coach-messages-validation'
import { validateStationsFile } from '@/lib/validate-stations'
import { applyDemoInstance } from '../scripts/apply-demo-instance.mjs'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function fixtureRoot() {
  const root = mkdtempSync(join(tmpdir(), 'demo-instance-'))
  mkdirSync(join(root, 'public', 'stations', '360'), { recursive: true })
  mkdirSync(join(root, 'public', 'demo'), { recursive: true })
  mkdirSync(join(root, 'public', 'qr'), { recursive: true })
  mkdirSync(join(root, 'public', 'brand', 'logos'), { recursive: true })
  mkdirSync(join(root, 'public', 'brand', 'hub'), { recursive: true })
  mkdirSync(join(root, 'data'), { recursive: true })
  mkdirSync(join(root, 'content'), { recursive: true })
  writeFileSync(join(root, 'public', 'stations', 'klassenzimmer.jpg'), 'schule')
  writeFileSync(join(root, 'public', 'stations', '360', 'musik.jpg'), 'schule')
  writeFileSync(join(root, 'public', 'demo', 'foto.jpg'), 'schule')
  writeFileSync(join(root, 'public', 'qr', 'entry-fest.png'), 'schule')
  writeFileSync(join(root, 'public', 'brand', 'logos', 'badge.svg'), '<svg>39</svg>')
  writeFileSync(join(root, 'public', 'brand', 'hub', 'gs39-front-outline.svg'), '<svg>schule</svg>')
  writeFileSync(join(root, 'data', 'stations.json'), '{"stations":[]}')
  return root
}

describe('applyDemoInstance', () => {
  it('lässt den Baum in Ruhe, wenn die Instanz nicht demo ist', () => {
    const root = fixtureRoot()
    const result = applyDemoInstance(root, { SN_INSTANCE: 'gs39', APPLY_DEMO_INSTANCE: '1' })
    expect(result.applied).toBe(false)
    expect(readFileSync(join(root, 'public', 'stations', 'klassenzimmer.jpg'), 'utf8')).toBe('schule')
  })

  it('ersetzt Schuldateien nur mit ausdrücklicher Freigabe', () => {
    const root = fixtureRoot()
    expect(() => applyDemoInstance(root, { SN_INSTANCE: 'demo' })).toThrow(/APPLY_DEMO_INSTANCE/)
    expect(readFileSync(join(root, 'data', 'stations.json'), 'utf8')).toBe('{"stations":[]}')
  })

  it('setzt den Demo-Seed ein und entfernt Schulmedien', () => {
    const root = fixtureRoot()
    cpSync(join(appRoot, 'demo-seed'), join(root, 'demo-seed'), { recursive: true })
    const result = applyDemoInstance(root, { SN_INSTANCE: 'demo', APPLY_DEMO_INSTANCE: '1' })
    expect(result).toEqual({ applied: true, stations: 12 })

    const stationsRaw = readFileSync(join(root, 'data', 'stations.json'), 'utf8')
    const coachRaw = readFileSync(join(root, 'content', 'coach-messages.json'), 'utf8')
    expect(stationsRaw).not.toMatch(/39\. Grundschule|Dresden-Plauen|GS39/)
    expect(coachRaw).not.toMatch(/39\. Grundschule|Dresden-Plauen|GS39/)
    expect(existsSync(join(root, 'public', 'stations', 'klassenzimmer.jpg'))).toBe(true)
    expect(readFileSync(join(root, 'public', 'stations', 'klassenzimmer.jpg'), 'utf8')).not.toBe('schule')
    expect(existsSync(join(root, 'public', 'stations', '360', 'musik.jpg'))).toBe(false)
    expect(existsSync(join(root, 'public', 'demo', 'foto.jpg'))).toBe(false)
    expect(existsSync(join(root, 'public', 'qr', 'entry-fest.png'))).toBe(false)
    expect(existsSync(join(root, 'public', 'brand', 'logos', 'badge.svg'))).toBe(false)
    expect(existsSync(join(root, 'public', 'brand', 'hub', 'demo-front.jpg'))).toBe(true)
    expect(existsSync(join(root, 'public', 'brand', 'hub', 'gs39-front-outline.svg'))).toBe(false)
    expect(existsSync(join(root, 'public', 'media', 'lesewelt', 'texte', 'beispiel.md'))).toBe(true)

    const stations = validateStationsFile(JSON.parse(stationsRaw))
    const slugs = new Set(stations.map((station) => station.slug))
    const errors = validateCoachMessagesContent(JSON.parse(coachRaw), stations.length, slugs)
    expect(errors).toEqual([])
  })
})
