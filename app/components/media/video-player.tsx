'use client'

import { useEffect, useRef } from 'react'
import type { Medium } from '@/lib/types'

export type VideoPlayerProps = {
  medium: Medium
}

const VIDEO_EXTS = /\.(mp4|webm|mov)$/i

export function VideoPlayer({ medium }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { quelle, videoSource, poster, untertitel } = medium

  // Cleanup: Wiedergabe stoppen wenn Panel geschlossen wird (analog dialog-player.tsx)
  useEffect(() => {
    return () => {
      videoRef.current?.pause()
    }
  }, [])

  if (videoSource === 'youtube') {
    return (
      <div className="sn-media-youtube-stub">
        <span className="text-2xl" aria-hidden>
          🎬
        </span>
        <p className="text-sm font-medium text-fg-2">YouTube-Video</p>
        <p className="text-xs text-fg-3">Noch nicht verfügbar (ADR-004)</p>
      </div>
    )
  }

  const isVideoFile = VIDEO_EXTS.test(quelle)

  if (!isVideoFile) {
    return (
      <figure className="sn-media-video-poster">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamische Stations-URL aus JSON */}
        <img
          src={quelle}
          alt={untertitel ?? 'Video-Vorschau'}
          className="sn-media-video-poster__img"
        />
        {untertitel ? (
          <figcaption className="sn-media-video-poster__caption">{untertitel}</figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- captions obliegen dem Auftraggeber
    <video
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      className="sn-media-video"
    >
      <source src={quelle} />
    </video>
  )
}
