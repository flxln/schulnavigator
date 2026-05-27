'use client'

import type { Medium } from '@/lib/types'

export type MediaPlayerByTypProps = {
  medium: Medium
}

export function MediaPlayerByTyp({ medium }: MediaPlayerByTypProps) {
  switch (medium.typ) {
    case 'audio':
      return <audio controls className="w-full" src={medium.quelle} />
    case 'video': {
      const isImagePoster = /\.(jpe?g|png|webp)$/i.test(medium.quelle)
      if (isImagePoster) {
        return (
          <figure className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- Poster-Platzhalter aus JSON */}
            <img
              src={medium.quelle}
              alt={medium.untertitel ?? 'Video-Platzhalter'}
              className="aspect-video w-full max-h-[50vh] rounded-[var(--r-sm)] bg-bg-dark object-cover"
            />
            <figcaption className="text-center text-sm text-fg-2">
              {medium.untertitel ?? 'Video folgt'}
            </figcaption>
          </figure>
        )
      }
      return (
        <video
          controls
          playsInline
          preload="metadata"
          poster={medium.untertitel ? undefined : medium.quelle}
          className="aspect-video w-full max-h-[50vh] rounded-[var(--r-sm)] bg-bg-dark"
        >
          <source src={medium.quelle} />
        </video>
      )
    }
    case 'foto':
      return (
        // eslint-disable-next-line @next/next/no-img-element -- dynamische Stations-URL aus JSON
        <img
          src={medium.quelle}
          alt={medium.untertitel ?? 'Stationsfoto'}
          className="max-h-[50vh] w-auto max-w-full rounded-[var(--r-sm)] object-contain"
        />
      )
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
