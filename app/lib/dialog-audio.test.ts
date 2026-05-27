import { describe, expect, it } from 'vitest'
import { DIALOG_CLIP_RE, parseDialogApiPath } from '@/lib/dialog-audio'

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
})
