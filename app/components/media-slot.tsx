import Image from 'next/image'
import type { Medium } from '@/lib/types'

const TYP_LABEL: Record<Medium['typ'], string> = {
  audio: 'Audio',
  video: 'Video',
  foto: 'Foto',
  text: 'Text',
}

export type MediaSlotProps = {
  medium: Medium
  onMediaSelect?: (medium: Medium) => void
}

export function MediaSlot({ medium, onMediaSelect }: MediaSlotProps) {
  const label = TYP_LABEL[medium.typ]
  const interactive = typeof onMediaSelect === 'function'

  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      {medium.untertitel ? (
        <p className="mt-1 text-sm text-zinc-700">{medium.untertitel}</p>
      ) : null}
      {medium.typ === 'foto' ? (
        <div className="relative mt-3 aspect-video w-full max-h-48 overflow-hidden rounded-md bg-zinc-100">
          <Image
            src={medium.quelle}
            alt={medium.untertitel ?? 'Stationsfoto'}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      ) : null}
      {medium.typ === 'text' ? (
        <p className="mt-2 text-sm text-zinc-600">
          <a
            href={medium.quelle}
            className="font-medium text-zinc-900 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Textdatei öffnen
          </a>
          <span className="text-zinc-500"> ({medium.quelle})</span>
        </p>
      ) : null}
      {(medium.typ === 'audio' || medium.typ === 'video') && (
        <p className="mt-2 text-sm text-zinc-600">
          Player und Wiedergabe folgen in Phase 2.
        </p>
      )}
    </>
  )

  if (interactive) {
    return (
      <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => onMediaSelect(medium)}
        >
          {body}
        </button>
      </article>
    )
  }

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      {body}
    </article>
  )
}
