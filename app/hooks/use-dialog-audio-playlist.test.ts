import { renderHook, act } from '@testing-library/react'
import { createRef, type MutableRefObject } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Dialog } from '@/lib/types'
import { useDialogAudioPlaylist } from '@/hooks/use-dialog-audio-playlist'

const textOnlyDialog: Dialog = {
  figuren: ['otto'],
  segmente: [
    { id: 's1', rolle: 'otto', text: 'Hallo Lesewelt!' },
    { id: 's2', rolle: 'otto', text: 'Noch ein Satz.' },
  ],
}

const mixedDialog: Dialog = {
  figuren: ['frieda', 'otto'],
  segmente: [
    { id: 's1', rolle: 'otto', text: 'Nur Text' },
    {
      id: 's2',
      rolle: 'frieda',
      text: 'Mit Ton',
      quelle: '/api/dialog/daz/02-frieda.wav',
    },
  ],
}

describe('useDialogAudioPlaylist', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountWithAudio(dialog: Dialog | undefined) {
    const { result } = renderHook(() => useDialogAudioPlaylist(dialog))
    const el = document.createElement('audio')
    act(() => {
      ;(result.current.audioRef as MutableRefObject<HTMLAudioElement | null>).current =
        el
    })
    return { result, el }
  }

  it('zeigt Text-only-Segment ohne play()', () => {
    const { result, el } = mountWithAudio(textOnlyDialog)
    const playSpy = vi.spyOn(el, 'play')

    act(() => {
      result.current.startFromUserGesture()
    })

    expect(result.current.dialogUiActive).toBe(true)
    expect(result.current.currentSegmentIsTextOnly).toBe(true)
    expect(result.current.playing).toBe(false)
    expect(result.current.displayText).toBe('Hallo Lesewelt!')
    expect(playSpy).not.toHaveBeenCalled()
  })

  it('advanceFromUserGesture geht bei Text-only zum nächsten Segment', () => {
    const { result } = mountWithAudio(textOnlyDialog)

    act(() => {
      result.current.startFromUserGesture()
    })
    act(() => {
      result.current.advanceFromUserGesture()
    })

    expect(result.current.displayText).toBe('Noch ein Satz.')
    expect(result.current.currentSegmentIsTextOnly).toBe(true)
  })

  it('beendet Dialog nach letztem Text-only-Segment', () => {
    const { result } = mountWithAudio(textOnlyDialog)

    act(() => {
      result.current.startFromUserGesture()
    })
    act(() => {
      result.current.advanceFromUserGesture()
    })
    act(() => {
      result.current.advanceFromUserGesture()
    })

    expect(result.current.dialogUiActive).toBe(false)
    expect(result.current.segmentIndex).toBeNull()
  })

  it('spielt Audio-Segment mit quelle ab', () => {
    const { result, el } = mountWithAudio(mixedDialog)
    const playSpy = vi.spyOn(el, 'play').mockResolvedValue(undefined)

    act(() => {
      result.current.startFromUserGesture()
    })

    expect(result.current.currentSegmentIsTextOnly).toBe(true)
    expect(playSpy).not.toHaveBeenCalled()

    act(() => {
      result.current.advanceFromUserGesture()
    })

    expect(result.current.currentSegmentIsTextOnly).toBe(false)
    expect(playSpy).toHaveBeenCalled()
    expect(el.src).toContain('/api/dialog/daz/02-frieda.wav')
  })
})
