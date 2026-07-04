import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import raw from '@/data/stations.json'
import { UPLOAD_RULES } from '@/lib/mpz-upload-rules'
import { studioDemoKlassenzimmerStation } from '@/lib/test-fixtures/studio-demo-klassenzimmer'
import type { StationsFile } from '@/lib/types'
import { validateStationsFile } from '@/lib/validate-stations'
import {
  sizeWarnThresholdForPath,
  validateStationAssets,
} from '@/scripts/validate-station-assets'

describe('validateStationAssets structure mode', () => {
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

  it('grün ohne Bahn-B-Dateien wenn checkFiles false', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'struct-val-'))
    temps.push(appRoot)
    mkdirSync(join(appRoot, 'data'), { recursive: true })
    const data = structuredClone(raw) as StationsFile
    const { errors } = validateStationAssets(data, { appRoot, checkFiles: false })
    expect(errors).toEqual([])
  })

  it('rot bei ungültigem Pfad wenn checkFiles false', () => {
    expect(() =>
      validateStationsFile({
        stations: [
          {
            slug: 'test',
            titel: 'Test',
            medien: [{ id: 'm1', typ: 'foto', quelle: 'ohne-fuehrenden-slash.jpg' }],
          },
        ],
      }),
    ).toThrow()
  })

  it('rot bei fehlender Datei wenn checkFiles true', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'struct-val-'))
    temps.push(appRoot)
    mkdirSync(join(appRoot, 'data'), { recursive: true })
    const data: StationsFile = {
      stations: [structuredClone(studioDemoKlassenzimmerStation)],
    }
    const { errors } = validateStationAssets(data, { appRoot, checkFiles: true })
    expect(errors.some((e) => e.includes('Datei fehlt'))).toBe(true)
  })

  it('sizeWarnThresholdForPath: Video nutzt UPLOAD_RULES.video (150 MB)', () => {
    expect(sizeWarnThresholdForPath('/media/x/video/clip.mp4')).toBe(UPLOAD_RULES.video.maxBytes)
    expect(sizeWarnThresholdForPath('/media/x/audio/clip.mp3')).toBe(UPLOAD_RULES.audio.maxBytes)
  })

  it('warnt nicht für Video unter 150 MB', () => {
    const appRoot = mkdtempSync(join(tmpdir(), 'struct-val-'))
    temps.push(appRoot)
    const publicPath = join(appRoot, 'public', 'media', 'test', 'video', 'big.mp4')
    mkdirSync(dirname(publicPath), { recursive: true })
    writeFileSync(publicPath, Buffer.alloc(60 * 1024 * 1024))
    const data: StationsFile = {
      stations: [
        {
          slug: 'test',
          titel: 'Test',
          medien: [
            {
              id: 'v1',
              typ: 'video',
              quelle: '/media/test/video/big.mp4',
              videoSource: 'upload',
            },
          ],
        },
      ],
    }
    const { warnings } = validateStationAssets(data, { appRoot, checkFiles: true })
    expect(warnings.some((w) => w.includes('big.mp4'))).toBe(false)
  })
})
