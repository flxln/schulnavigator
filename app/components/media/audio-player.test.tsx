/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioPlayer } from '@/components/media/audio-player'

const mockPlay = vi.fn().mockResolvedValue(undefined)
const mockPause = vi.fn()

beforeEach(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    writable: true,
    value: mockPlay,
  })
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    writable: true,
    value: mockPause,
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('AudioPlayer', () => {
  it('zeigt Play-Button initial', () => {
    render(<AudioPlayer src="/demo/ton.wav" label="Demo" />)
    expect(screen.getByRole('button', { name: /abspielen/i })).toBeTruthy()
  })

  it('ruft play() bei Klick auf Play auf', async () => {
    render(<AudioPlayer src="/demo/ton.wav" />)
    const btn = screen.getByRole('button', { name: /abspielen/i })
    await fireEvent.click(btn)
    expect(mockPlay).toHaveBeenCalledTimes(1)
  })

  it('zeigt Fehler wenn src ungültig', () => {
    render(<AudioPlayer src="/demo/ton.wav" />)
    const audio = document.querySelector('audio') as HTMLAudioElement
    fireEvent.error(audio)
    expect(screen.getByText(/konnte nicht geladen/i)).toBeTruthy()
  })

  it('zeigt Fortschritts-Slider', () => {
    render(<AudioPlayer src="/demo/ton.wav" />)
    expect(screen.getByRole('slider', { name: /wiedergabeposition/i })).toBeTruthy()
  })

  it('zeigt Lautstärke-Slider', () => {
    render(<AudioPlayer src="/demo/ton.wav" />)
    expect(screen.getByRole('slider', { name: /lautstärke/i })).toBeTruthy()
  })
})
