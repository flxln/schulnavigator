import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import rawStations from '@/data/stations.json'
import coachFixture from '@/content/coach-messages.json'
import {
  createMpzContentIo,
  resetMpzWriteLockForTests,
  serializeCoachMessagesFile,
  serializeStationsFile,
} from '@/lib/mpz-content-io'
import {
  addCoachMessage,
  MpzCoachMessagesError,
  patchCoachMessage,
  removeCoachMessage,
} from '@/lib/mpz-coach-messages'
import type { CoachMessagesFile, StationsFile } from '@/lib/types'

const stationsFixture = rawStations as StationsFile
const coachData = coachFixture as CoachMessagesFile
const temps: string[] = []

function makeTempIo(
  coach: CoachMessagesFile = coachData,
  stations: StationsFile = stationsFixture,
) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-coach-domain-'))
  temps.push(appRoot)
  const stationsPath = join(appRoot, 'data', 'stations.json')
  const coachPath = join(appRoot, 'content', 'coach-messages.json')
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'content'), { recursive: true })
  writeFileSync(stationsPath, serializeStationsFile(stations), 'utf8')
  writeFileSync(coachPath, serializeCoachMessagesFile(coach), 'utf8')
  return createMpzContentIo({
    appRoot,
    stationsPath,
    backupPath: `${stationsPath}.bak`,
    coachPath,
    coachBackupPath: `${coachPath}.bak`,
  })
}

function readCoach(io: ReturnType<typeof makeTempIo>): CoachMessagesFile {
  return JSON.parse(
    readFileSync(io.getPaths().coachPath, 'utf8'),
  ) as CoachMessagesFile
}

afterEach(() => {
  resetMpzWriteLockForTests()
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('addCoachMessage', () => {
  it('legt hub-milestone an', async () => {
    const io = makeTempIo()
    const result = await addCoachMessage(
      {
        id: 'test-milestone',
        trigger: 'hub-milestone',
        milestone: 2,
        mascot: 'otto',
        placement: 'left',
        text: 'Test',
      },
      io,
    )
    expect(result.messages.some((m) => m.id === 'test-milestone')).toBe(true)
    expect(readCoach(io).messages.some((m) => m.id === 'test-milestone')).toBe(true)
  })

  it('wirft DUPLICATE_ID', async () => {
    const io = makeTempIo()
    await expect(
      addCoachMessage(
        {
          id: 'welcome-hub',
          trigger: 'hub-milestone',
          milestone: 0,
          mascot: 'frieda',
          placement: 'left',
          text: 'Dup',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'DUPLICATE_ID' })
  })

  it('wirft INVALID_MILESTONE bei zu hohem milestone', async () => {
    const io = makeTempIo()
    await expect(
      addCoachMessage(
        {
          id: 'too-high',
          trigger: 'hub-milestone',
          milestone: 99,
          mascot: 'frieda',
          placement: 'left',
          text: 'Test',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_MILESTONE' })
  })

  it('wirft DUPLICATE_HUB_COMPLETE', async () => {
    const io = makeTempIo()
    await expect(
      addCoachMessage(
        {
          id: 'second-complete',
          trigger: 'hub-complete',
          mascot: 'duo',
          placement: 'duo-split',
          text: 'Nochmal',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'DUPLICATE_HUB_COMPLETE' })
  })
})

describe('patchCoachMessage', () => {
  it('aktualisiert text', async () => {
    const io = makeTempIo()
    const result = await patchCoachMessage('welcome-hub', { text: 'Neu' }, io)
    const updated = result.messages.find((m) => m.id === 'welcome-hub')
    expect(updated?.text).toBe('Neu')
  })

  it('entfernt modes mit null', async () => {
    const io = makeTempIo()
    const result = await patchCoachMessage('welcome-hub', { modes: null }, io)
    const updated = result.messages.find((m) => m.id === 'welcome-hub')
    expect(updated?.modes).toBeUndefined()
  })

  it('wirft NO_FIELDS bei leerem Patch', async () => {
    const io = makeTempIo()
    await expect(patchCoachMessage('welcome-hub', {}, io)).rejects.toMatchObject({
      code: 'NO_FIELDS',
    })
  })
})

describe('removeCoachMessage', () => {
  it('löscht room-first Message', async () => {
    const io = makeTempIo()
    const result = await removeCoachMessage('room-first-hort', io)
    expect(result.messages.some((m) => m.id === 'room-first-hort')).toBe(false)
  })

  it('wirft LAST_HUB_COMPLETE', async () => {
    const io = makeTempIo()
    await expect(removeCoachMessage('complete', io)).rejects.toMatchObject({
      code: 'LAST_HUB_COMPLETE',
    })
  })

  it('wirft NOT_FOUND', async () => {
    const io = makeTempIo()
    await expect(removeCoachMessage('missing', io)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})

describe('postValidate Rollback', () => {
  it('schreibt nicht bei ungültigem Zustand nach Mutation', async () => {
    const broken: CoachMessagesFile = {
      messages: coachData.messages.filter((m) => m.trigger !== 'hub-complete'),
    }
    const io = makeTempIo(broken)
    await expect(
      addCoachMessage(
        {
          id: 'another',
          trigger: 'hub-milestone',
          milestone: 0,
          mascot: 'frieda',
          placement: 'left',
          text: 'Test',
        },
        io,
      ),
    ).rejects.toBeTruthy()

    const onDisk = readCoach(io)
    expect(onDisk.messages).toHaveLength(broken.messages.length)
  })
})

describe('MpzCoachMessagesError', () => {
  it('INVALID_DUO_PLACEMENT bei frieda + duo-split', async () => {
    const io = makeTempIo()
    await expect(
      addCoachMessage(
        {
          id: 'bad-duo',
          trigger: 'hub-milestone',
          milestone: 2,
          mascot: 'frieda',
          placement: 'duo-split',
          text: 'Test',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_DUO_PLACEMENT' })
  })
})
