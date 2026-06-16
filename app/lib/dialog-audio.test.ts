import { describe, expect, it } from 'vitest'
import {
  DIALOG_CLIP_RE,
  buildClipName,
  dialogApiQuelle,
  dialogAudioFilePath,
  dialogAudioFsPath,
  parseDialogApiPath,
} from '@/lib/dialog-audio'

describe('dialog-audio', () => {
  it('parst gültige API-Pfade', () => {
    expect(parseDialogApiPath('/api/dialog/daz/01-frieda.wav')).toEqual({
      slug: 'daz',
      clip: '01-frieda.wav',
    })
    expect(parseDialogApiPath('/api/dialog/pc-raum/09-beide.wav')).toEqual({
      slug: 'pc-raum',
      clip: '09-beide.wav',
    })
  })

  it('lehnt ungültige Pfade ab', () => {
    expect(parseDialogApiPath('/api/dialog/daz/../x.wav')).toBeNull()
    expect(parseDialogApiPath('/stations/daz.jpg')).toBeNull()
  })

  it('CLIP_RE matcht erlaubte Dateinamen', () => {
    expect(DIALOG_CLIP_RE.test('01-frieda.wav')).toBe(true)
    expect(DIALOG_CLIP_RE.test('09-beide.wav')).toBe(true)
    expect(DIALOG_CLIP_RE.test('01-Frieda.wav')).toBe(false)
  })

  it('buildClipName erzeugt konventionskonforme Namen', () => {
    expect(buildClipName(0, 'frieda')).toBe('01-frieda.wav')
    expect(buildClipName(8, 'beide')).toBe('09-beide.wav')
  })

  it('dialogApiQuelle baut API-Pfad', () => {
    expect(dialogApiQuelle('daz', '01-frieda.wav')).toBe('/api/dialog/daz/01-frieda.wav')
  })

  it('dialogAudioFsPath ist deterministisch über appRoot', () => {
    const appRoot = '/tmp/app'
    expect(dialogAudioFsPath(appRoot, 'daz', '01-frieda.wav')).toBe(
      '/tmp/app/content/dialog-audio/daz/01-frieda.wav',
    )
  })

  it('dialogAudioFilePath nutzt appRoot aus getStationsPaths (P1)', () => {
    const clip = '01-frieda.wav'
    const slug = 'daz'
    const fromHelper = dialogAudioFilePath(slug, clip)
    const appRoot = fromHelper.replace(`/content/dialog-audio/${slug}/${clip}`, '')
    expect(dialogAudioFsPath(appRoot, slug, clip)).toBe(fromHelper)
  })
})
