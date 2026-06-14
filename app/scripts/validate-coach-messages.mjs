import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const coachPath = join(appRoot, 'content', 'coach-messages.json')
const stationsPath = join(appRoot, 'data', 'stations.json')

const PLACEMENTS = new Set(['bottom', 'left', 'right', 'duo-split'])
const TRIGGERS = new Set(['hub-milestone', 'hub-complete', 'room-first'])
const MASCOTS = new Set(['frieda', 'otto', 'duo'])
const MODES = new Set(['fest', 'heft'])

function fail(msg) {
  console.error(`validate:coach: ${msg}`)
  process.exitCode = 1
}

if (!existsSync(coachPath)) {
  fail(`fehlende Datei ${coachPath}`)
  process.exit(1)
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
  process.exit(1)
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
}

if (hubCompleteCount !== 1) {
  fail(`genau eine hub-complete-Message erwartet, gefunden: ${hubCompleteCount}`)
}

if (maxHubMilestone >= stationCount) {
  fail(`höchste hub-milestone (${maxHubMilestone}) muss < ${stationCount} sein`)
}

if (process.exitCode === 1) {
  process.exit(1)
}

console.log(
  `validate:coach OK (${messages.length} Messages, ${stationCount} Stationen)`,
)
