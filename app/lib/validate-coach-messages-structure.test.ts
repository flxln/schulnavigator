import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { validateCoachMessages } from '../scripts/validate-coach-messages.mjs'

describe('validateCoachMessages structure mode', () => {
  const temps: string[] = []

  afterEach(() => {
    for (const dir of temps) {
      try {
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    temps.length = 0
  })

  function setupSandbox(coachMessages: unknown, stations: unknown): string {
    const appRoot = mkdtempSync(join(tmpdir(), 'coach-struct-'))
    temps.push(appRoot)
    mkdirSync(join(appRoot, 'content'), { recursive: true })
    mkdirSync(join(appRoot, 'data'), { recursive: true })
    writeFileSync(
      join(appRoot, 'content', 'coach-messages.json'),
      JSON.stringify(coachMessages),
      'utf8',
    )
    writeFileSync(join(appRoot, 'data', 'stations.json'), JSON.stringify(stations), 'utf8')
    return appRoot
  }

  const coachWithAudio = {
    messages: [
      {
        id: 'welcome-hub',
        trigger: 'hub-milestone',
        milestone: 0,
        mascot: 'otto',
        placement: 'bottom',
        text: 'Willkommen!',
        quelle: '/api/coach/welcome-hub',
      },
      {
        id: 'hub-done',
        trigger: 'hub-complete',
        mascot: 'duo',
        placement: 'duo-split',
        text: 'Fertig!',
      },
    ],
  }

  const stationsMinimal = { stations: [{ slug: 'klassenzimmer' }, { slug: 'musik' }] }

  it('grün ohne welcome-hub.wav wenn checkAudioFiles false', () => {
    const appRoot = setupSandbox(coachWithAudio, stationsMinimal)
    const result = validateCoachMessages({ appRoot, checkAudioFiles: false })
    expect(result.ok).toBe(true)
  })

  it('rot ohne welcome-hub.wav wenn checkAudioFiles true', () => {
    const appRoot = setupSandbox(coachWithAudio, stationsMinimal)
    const result = validateCoachMessages({ appRoot, checkAudioFiles: true })
    expect(result.ok).toBe(false)
  })
})
