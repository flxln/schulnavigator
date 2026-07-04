import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PLACEMENTS = new Set(['bottom', 'left', 'right', 'duo-split'])
const TRIGGERS = new Set(['hub-milestone', 'hub-complete', 'room-first'])
const MASCOTS = new Set(['frieda', 'otto', 'duo'])
const MODES = new Set(['fest', 'heft'])

const LAYOUT_KEYS = new Set([
  'mascotSize',
  'mascotOffsetX',
  'mascotOffsetY',
  'bubbleMaxWidth',
  'bubbleOffsetX',
  'bubbleOffsetY',
  'bubbleFontSize',
  'mascotFlipX',
  'mascotFlipY',
])

const LAYOUT_BOOLEAN_KEYS = new Set(['mascotFlipX', 'mascotFlipY'])

const LAYOUT_CLAMPS = {
  mascotSize: { min: 0.15, max: 0.55 },
  mascotOffsetX: { min: -20, max: 20 },
  mascotOffsetY: { min: -20, max: 20 },
  bubbleMaxWidth: { min: 12, max: 32 },
  bubbleOffsetX: { min: -20, max: 20 },
  bubbleOffsetY: { min: -20, max: 20 },
  bubbleFontSize: { min: 12, max: 20 },
}

function validateLayout(layout, ctx, fail) {
  if (layout === undefined) {
    return
  }
  if (typeof layout !== 'object' || layout === null || Array.isArray(layout)) {
    fail(`${ctx}: layout muss ein Objekt sein`)
    return
  }
  for (const key of Object.keys(layout)) {
    if (!LAYOUT_KEYS.has(key)) {
      fail(`${ctx}: unbekanntes layout-Feld "${key}"`)
    }
  }
  for (const [key, clamp] of Object.entries(LAYOUT_CLAMPS)) {
    if (!(key in layout)) {
      continue
    }
    const value = layout[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      fail(`${ctx}: layout.${key} muss eine endliche Zahl sein`)
      continue
    }
    if (value < clamp.min || value > clamp.max) {
      fail(`${ctx}: layout.${key} außerhalb ${clamp.min}–${clamp.max}`)
    }
  }
  for (const key of LAYOUT_BOOLEAN_KEYS) {
    if (!(key in layout)) {
      continue
    }
    if (typeof layout[key] !== 'boolean') {
      fail(`${ctx}: layout.${key} muss boolean sein`)
    }
  }
}

/**
 * @param {{ appRoot: string, checkAudioFiles?: boolean }} options
 * @returns {{ ok: boolean, messageCount: number, stationCount: number }}
 */
export function validateCoachMessages({ appRoot, checkAudioFiles = true }) {
  const coachPath = join(appRoot, 'content', 'coach-messages.json')
  const stationsPath = join(appRoot, 'data', 'stations.json')
  let failed = false

  const fail = (msg) => {
    console.error(`validate:coach: ${msg}`)
    failed = true
  }

  if (!existsSync(coachPath)) {
    fail(`fehlende Datei ${coachPath}`)
    return { ok: false, messageCount: 0, stationCount: 0 }
  }

  const stationsFile = JSON.parse(readFileSync(stationsPath, 'utf8'))
  const stationSlugs = new Set(
    (stationsFile.stations ?? []).map((s) => s.slug).filter(Boolean),
  )
  const stationCount = stationSlugs.size

  const coachFile = JSON.parse(readFileSync(coachPath, 'utf8'))
  const messages = coachFile.messages
  if (!Array.isArray(messages)) {
    fail('coach-messages.json: messages muss ein Array sein')
    return { ok: false, messageCount: 0, stationCount }
  }

  const ids = new Set()
  let hubCompleteCount = 0
  let maxHubMilestone = -1

  for (const [index, raw] of messages.entries()) {
    const ctx = `messages[${index}]`
    if (typeof raw !== 'object' || raw === null) {
      fail(`${ctx}: kein Objekt`)
      continue
    }
    const m = raw

    if (typeof m.id !== 'string' || m.id.trim() === '') {
      fail(`${ctx}: id fehlt`)
    } else if (ids.has(m.id)) {
      fail(`${ctx}: doppelte id "${m.id}"`)
    } else {
      ids.add(m.id)
    }

    if (!TRIGGERS.has(m.trigger)) {
      fail(`${ctx}: ungültiger trigger "${m.trigger}"`)
    }

    if (!MASCOTS.has(m.mascot)) {
      fail(`${ctx}: ungültiger mascot "${m.mascot}"`)
    }

    if (!PLACEMENTS.has(m.placement)) {
      fail(`${ctx}: ungültiger placement "${m.placement}"`)
    }

    if (m.mascot === 'duo' && m.placement !== 'duo-split') {
      fail(`${ctx}: mascot "duo" erfordert placement "duo-split"`)
    }
    if (m.placement === 'duo-split' && m.mascot !== 'duo') {
      fail(`${ctx}: placement "duo-split" erfordert mascot "duo"`)
    }

    if (typeof m.text !== 'string' || m.text.trim() === '') {
      fail(`${ctx}: text fehlt`)
    }

    if (m.modes !== undefined) {
      if (!Array.isArray(m.modes) || m.modes.length === 0) {
        fail(`${ctx}: modes muss ein nicht-leeres Array sein`)
      } else {
        for (const mode of m.modes) {
          if (!MODES.has(mode)) {
            fail(`${ctx}: ungültiger mode "${mode}"`)
          }
        }
      }
    }

    if (m.trigger === 'hub-milestone') {
      if (typeof m.milestone !== 'number' || !Number.isInteger(m.milestone)) {
        fail(`${ctx}: hub-milestone braucht ganzzahliges milestone`)
      } else if (m.milestone < 0 || m.milestone >= stationCount) {
        fail(
          `${ctx}: milestone ${m.milestone} außerhalb 0–${stationCount - 1}`,
        )
      } else if (m.milestone > maxHubMilestone) {
        maxHubMilestone = m.milestone
      }
      if (m.slug !== undefined) {
        fail(`${ctx}: hub-milestone darf kein slug haben`)
      }
    }

    if (m.trigger === 'hub-complete') {
      hubCompleteCount += 1
      if (m.milestone !== undefined) {
        fail(`${ctx}: hub-complete darf kein milestone haben`)
      }
      if (m.slug !== undefined) {
        fail(`${ctx}: hub-complete darf kein slug haben`)
      }
    }

    if (m.trigger === 'room-first') {
      if (typeof m.slug !== 'string' || !stationSlugs.has(m.slug)) {
        fail(`${ctx}: room-first slug "${m.slug}" unbekannt in stations.json`)
      }
      if (m.milestone !== undefined) {
        fail(`${ctx}: room-first darf kein milestone haben`)
      }
    }

    validateLayout(m.layout, ctx, fail)

    if (typeof m.id === 'string' && m.id.trim() !== '') {
      if (m.quelle !== undefined) {
        if (typeof m.quelle !== 'string') {
          fail(`${ctx}: quelle muss String sein`)
        } else if (!m.quelle.startsWith('/')) {
          fail(`${ctx}: quelle muss mit / beginnen`)
        } else if (m.quelle !== `/api/coach/${m.id}`) {
          fail(`${ctx}: quelle muss "/api/coach/${m.id}" sein`)
        } else if (checkAudioFiles) {
          const wavPath = join(appRoot, 'content', 'coach-audio', `${m.id}.wav`)
          if (!existsSync(wavPath)) {
            fail(`${ctx}: quelle gesetzt, aber content/coach-audio/${m.id}.wav fehlt`)
          }
        }
      }
    }
  }

  if (hubCompleteCount !== 1) {
    fail(`genau eine hub-complete-Message erwartet, gefunden: ${hubCompleteCount}`)
  }

  if (maxHubMilestone >= stationCount) {
    fail(`höchste hub-milestone (${maxHubMilestone}) muss < ${stationCount} sein`)
  }

  return { ok: !failed, messageCount: messages.length, stationCount }
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1]

if (isMain) {
  const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const result = validateCoachMessages({ appRoot, checkAudioFiles: true })
  if (!result.ok) {
    process.exit(1)
  }
  console.log(
    `validate:coach OK (${result.messageCount} Messages, ${result.stationCount} Stationen)`,
  )
}
