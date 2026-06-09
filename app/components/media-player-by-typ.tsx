'use client'

import dynamic from 'next/dynamic'
import type { Medium } from '@/lib/types'
import { AudioPlayer } from '@/components/media/audio-player'
import { VideoPlayer } from '@/components/media/video-player'
import { PhotoViewer } from '@/components/media/photo-viewer'

const TextViewer = dynamic(
  () => import('@/components/media/text-viewer').then((m) => m.TextViewer),
  { ssr: false },
)

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
      return <TextViewer src={medium.quelle} />
    default:
      return null
  }
}
