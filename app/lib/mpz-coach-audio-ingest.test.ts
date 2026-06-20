import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import rawStations from '@/data/stations.json'
import coachFixture from '@/content/coach-messages.json'
import { coachApiQuelle } from '@/lib/coach-audio'
import { createMpzContentIo, serializeCoachMessagesFile } from '@/lib/mpz-content-io'
import {
  auditCoachAudio,
  deriveCoachAudioState,
  ingestCoachClip,
  resetCoachIngestLockForTests,
} from '@/lib/mpz-coach-audio-ingest'
import { MpzCoachMessagesError } from '@/lib/mpz-coach-messages'
import { MpzUploadError } from '@/lib/mpz-upload-rules'
import type { CoachMessagesFile, StationsFile } from '@/lib/types'

const stationsFixture = rawStations as StationsFile
const coachData = coachFixture as CoachMessagesFile
const temps: string[] = []

function pad(b: Buffer, min = 1024): Buffer {
  return Buffer.concat([b, Buffer.alloc(Math.max(0, min - b.length), 0x20)])
}

const WAV_A = pad(
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0x24, 0, 0, 0]),
    Buffer.from('WAVEfmt '),
    Buffer.from('CLIP-A'),
  ]),
)

function makeTempIo(coach: CoachMessagesFile = coachData) {
  const appRoot = mkdtempSync(join(tmpdir(), 'mpz-coach-audio-'))
  temps.push(appRoot)
  mkdirSync(join(appRoot, 'data'), { recursive: true })
  mkdirSync(join(appRoot, 'content', 'coach-audio'), { recursive: true })
  writeFileSync(
    join(appRoot, 'data', 'stations.json'),
    JSON.stringify(stationsFixture, null, 2),
  )
  writeFileSync(
    join(appRoot, 'content', 'coach-messages.json'),
    serializeCoachMessagesFile(coach),
  )
  return createMpzContentIo({
    appRoot,
    stationsPath: join(appRoot, 'data', 'stations.json'),
    backupPath: join(appRoot, 'data', 'stations.json.bak'),
    coachPath: join(appRoot, 'content', 'coach-messages.json'),
    coachBackupPath: join(appRoot, 'content', 'coach-messages.json.bak'),
  })
}

afterEach(() => {
  resetCoachIngestLockForTests()
  for (const dir of temps) {
    rmSync(dir, { recursive: true, force: true })
  }
  temps.length = 0
})

describe('deriveCoachAudioState', () => {
  it('deckt Kombinationen ab', () => {
    expect(deriveCoachAudioState(true, true, true)).toBe('ok')
    expect(deriveCoachAudioState(false, true, true)).toBe('leer')
    expect(deriveCoachAudioState(true, false, true)).toBe('drift')
    expect(deriveCoachAudioState(true, false, false)).toBe('fehlt')
  })
})

describe('auditCoachAudio', () => {
  it('findet verwaiste WAVs', () => {
    const io = makeTempIo()
    const { appRoot } = io.getPaths()
    writeFileSync(join(appRoot, 'content', 'coach-audio', 'orphan.wav'), WAV_A)
    const audit = auditCoachAudio(coachData.messages, appRoot)
    expect(audit.orphans).toContain('orphan')
  })
})

describe('ingestCoachClip', () => {
  it('schreibt WAV und setzt quelle', async () => {
    const io = makeTempIo()
    const result = await ingestCoachClip(
      {
        messageId: 'welcome-hub',
        source: { buffer: WAV_A },
        originalName: 'clip.wav',
      },
      io,
    )
    expect(result.quelle).toBe(coachApiQuelle('welcome-hub'))
    const onDisk = JSON.parse(
      readFileSync(io.getPaths().coachPath, 'utf8'),
    ) as CoachMessagesFile
    const msg = onDisk.messages.find((m) => m.id === 'welcome-hub')
    expect(msg?.quelle).toBe(coachApiQuelle('welcome-hub'))
  })

  it('wirft NOT_FOUND für unbekannte Message', async () => {
    const io = makeTempIo()
    await expect(
      ingestCoachClip(
        {
          messageId: 'missing-id',
          source: { buffer: WAV_A },
          originalName: 'clip.wav',
        },
        io,
      ),
    ).rejects.toBeInstanceOf(MpzCoachMessagesError)
  })

  it('wirft COLLISION bei reject', async () => {
    const io = makeTempIo()
    const { appRoot } = io.getPaths()
    writeFileSync(join(appRoot, 'content', 'coach-audio', 'welcome-hub.wav'), WAV_A)
    await expect(
      ingestCoachClip(
        {
          messageId: 'welcome-hub',
          source: { buffer: WAV_A },
          originalName: 'clip.wav',
          collision: 'reject',
        },
        io,
      ),
    ).rejects.toMatchObject({ code: 'COLLISION' })
  })
})
