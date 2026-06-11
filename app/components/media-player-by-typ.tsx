'use client'

import dynamic from 'next/dynamic'
import type { Medium } from '@/lib/types'
import { AudioPlayer } from '@/components/media/audio-player'
import { VideoPlayer } from '@/components/media/video-player'
import { EmbedViewer } from '@/components/media/embed-viewer'
import { resolveEmbedAllowlist } from '@/lib/embed-allowlist'
import { LinkViewer } from '@/components/media/link-viewer'
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
    case 'link':
      return (
        <LinkViewer url={medium.quelle} label={medium.untertitel} />
      )
    case 'embed':
      return (
        <EmbedViewer
          url={medium.quelle}
          allowlist={resolveEmbedAllowlist(medium)}
          label={medium.untertitel}
        />
      )
    default:
      return null
  }
}
