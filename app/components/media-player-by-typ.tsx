'use client'

import type { Medium } from '@/lib/types'
import { AudioPlayer } from '@/components/media/audio-player'
import { VideoPlayer } from '@/components/media/video-player'
import { PhotoViewer } from '@/components/media/photo-viewer'

export type MediaPlayerByTypProps = {
  medium: Medium
}

export function MediaPlayerByTyp({ medium }: MediaPlayerByTypProps) {
  switch (medium.typ) {
    case 'audio':
      return <AudioPlayer src={medium.quelle} label={medium.untertitel} />
    case 'video':
      return <VideoPlayer medium={medium} />
    case 'foto':
      return <PhotoViewer src={medium.quelle} alt={medium.untertitel ?? 'Stationsfoto'} />
    case 'text':
      return (
        <p className="text-sm text-fg-2">
          <a
            href={medium.quelle}
            className="font-medium text-accent-alt underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Textdatei öffnen
          </a>
        </p>
      )
    default:
      return null
  }
}
