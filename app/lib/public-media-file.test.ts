import { describe, expect, it } from 'vitest'
import {
  isSafePublicMediaSegment,
  publicMediaContentType,
  resolvePublicMediaFilePath,
} from './public-media-file'

describe('public-media-file', () => {
  it('lehnt unsichere Segmente ab', () => {
    expect(isSafePublicMediaSegment('..')).toBe(false)
    expect(isSafePublicMediaSegment('foo/bar')).toBe(false)
    expect(isSafePublicMediaSegment('video-hallo.mp4')).toBe(true)
  })

  it('resolvePublicMediaFilePath verhindert Path-Traversal', () => {
    expect(resolvePublicMediaFilePath(['daz', '..', 'stations', 'daz.jpg'])).toBeNull()
    expect(resolvePublicMediaFilePath(['daz', 'video', 'clip.mp4'])).toMatch(
      /public\/media\/daz\/video\/clip\.mp4$/,
    )
  })

  it('publicMediaContentType für gängige Endungen', () => {
    expect(publicMediaContentType('/app/public/media/x/video.mp4')).toBe('video/mp4')
    expect(publicMediaContentType('/app/public/media/x/icon.svg')).toBe('image/svg+xml')
  })
})
