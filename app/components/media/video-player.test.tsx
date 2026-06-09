/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { VideoPlayer } from '@/components/media/video-player'
import type { Medium } from '@/lib/types'

afterEach(() => cleanup())

const base: Omit<Medium, 'quelle' | 'typ'> = { id: 'v1' }

describe('VideoPlayer', () => {
  it('zeigt Upload-Video-Element bei MP4-Quelle', () => {
    const medium: Medium = {
      ...base,
      typ: 'video',
      videoSource: 'upload',
      quelle: '/demo/clip.mp4',
    }
    const { container } = render(<VideoPlayer medium={medium} />)
    expect(container.querySelector('video')).toBeTruthy()
    expect(container.querySelector('source')?.getAttribute('src')).toBe('/demo/clip.mp4')
  })

  it('zeigt Poster-only-Modus bei Bild-Quelle', () => {
    const medium: Medium = {
      ...base,
      typ: 'video',
      videoSource: 'upload',
      quelle: '/demo/video-plakat.jpg',
    }
    render(<VideoPlayer medium={medium} />)
    expect(screen.getByRole('img')).toBeTruthy()
    const { container } = render(<VideoPlayer medium={medium} />)
    expect(container.querySelector('video')).toBeNull()
  })

  it('zeigt Hinweis bei youtube-Quelle', () => {
    const medium: Medium = {
      ...base,
      typ: 'video',
      videoSource: 'youtube',
      quelle: 'dQw4w9WgXcQ',
    }
    render(<VideoPlayer medium={medium} />)
    expect(screen.getByText(/noch nicht verfügbar/i)).toBeTruthy()
  })

  it('setzt poster-Attribut wenn vorhanden', () => {
    const medium: Medium = {
      ...base,
      typ: 'video',
      videoSource: 'upload',
      quelle: '/demo/clip.mp4',
      poster: '/demo/poster.jpg',
    }
    const { container } = render(<VideoPlayer medium={medium} />)
    expect(container.querySelector('video')?.getAttribute('poster')).toBe('/demo/poster.jpg')
  })
})
