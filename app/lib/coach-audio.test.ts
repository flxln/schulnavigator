import { describe, expect, it } from 'vitest'
import {
  coachApiQuelle,
  coachAudioFsPath,
  COACH_MESSAGE_ID_RE,
  parseCoachApiPath,
  quelleMatchesCoachConvention,
} from '@/lib/coach-audio'

describe('coachApiQuelle', () => {
  it('baut Konventions-URL', () => {
    expect(coachApiQuelle('welcome-hub')).toBe('/api/coach/welcome-hub')
  })
})

describe('coachAudioFsPath', () => {
  it('zeigt auf content/coach-audio/{id}.wav', () => {
    expect(coachAudioFsPath('/app', 'welcome-hub')).toBe(
      '/app/content/coach-audio/welcome-hub.wav',
    )
  })
})

describe('parseCoachApiPath', () => {
  it('parst gültige Pfade', () => {
    expect(parseCoachApiPath('/api/coach/welcome-hub')).toEqual({
      messageId: 'welcome-hub',
    })
  })

  it('lehnt ungültige IDs ab', () => {
    expect(parseCoachApiPath('/api/coach/../x')).toBeNull()
    expect(parseCoachApiPath('/api/coach/')).toBeNull()
    expect(parseCoachApiPath('/api/dialog/daz/01-frieda.wav')).toBeNull()
  })
})

describe('COACH_MESSAGE_ID_RE', () => {
  it('akzeptiert gültige IDs', () => {
    expect(COACH_MESSAGE_ID_RE.test('welcome-hub')).toBe(true)
    expect(COACH_MESSAGE_ID_RE.test('room-first-klassenzimmer')).toBe(true)
  })

  it('lehnt ungültige IDs ab', () => {
    expect(COACH_MESSAGE_ID_RE.test('Welcome-Hub')).toBe(false)
    expect(COACH_MESSAGE_ID_RE.test('-bad')).toBe(false)
  })
})

describe('quelleMatchesCoachConvention', () => {
  it('prüft Konvention', () => {
    expect(quelleMatchesCoachConvention('/api/coach/welcome-hub', 'welcome-hub')).toBe(
      true,
    )
    expect(quelleMatchesCoachConvention('/api/coach/other', 'welcome-hub')).toBe(false)
  })
})
