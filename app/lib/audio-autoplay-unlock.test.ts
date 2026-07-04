/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AUDIO_UNLOCK_EVENT,
  isAudioPlaybackUnlocked,
  resetAudioPlaybackUnlockForTests,
  unlockAudioPlayback,
} from '@/lib/audio-autoplay-unlock'

describe('audio-autoplay-unlock', () => {
  afterEach(() => {
    resetAudioPlaybackUnlockForTests()
    vi.restoreAllMocks()
  })

  it('markiert nach erfolgreichem play als entsperrt', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(window, 'Audio').mockImplementation(function MockAudio(this: Audio) {
      return { play, pause: vi.fn(), volume: 1, src: '' } as unknown as Audio
    })

    unlockAudioPlayback()
    await play.mock.results[0]?.value

    expect(isAudioPlaybackUnlocked()).toBe(true)
  })

  it('feuert AUDIO_UNLOCK_EVENT einmal', async () => {
    const play = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(window, 'Audio').mockImplementation(function MockAudio(this: Audio) {
      return { play, pause: vi.fn(), volume: 1, src: '' } as unknown as Audio
    })

    const handler = vi.fn()
    window.addEventListener(AUDIO_UNLOCK_EVENT, handler)

    unlockAudioPlayback()
    await play.mock.results[0]?.value
    unlockAudioPlayback()

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
