import Image from 'next/image'
import type { Medium } from '@/lib/types'

const TYP_LABEL: Record<Medium['typ'], string> = {
  audio: 'Audio',
  video: 'Video',
  foto: 'Foto',
  text: 'Text',
  link: 'Link',
}

export type MediaSlotProps = {
  medium: Medium
  onMediaSelect?: (medium: Medium) => void
}

function previewSrc(medium: Medium): string | undefined {
  if (medium.thumbnail) {
    return medium.thumbnail
  }
  if (medium.typ === 'foto') {
    return medium.quelle
  }
  return undefined
}

export function MediaSlot({ medium, onMediaSelect }: MediaSlotProps) {
  const label = TYP_LABEL[medium.typ]
  const interactive = typeof onMediaSelect === 'function'
  const preview = previewSrc(medium)

  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-3">
        {label}
      </p>
      {medium.untertitel ? (
        <p className="mt-1 text-sm text-fg-2">{medium.untertitel}</p>
      ) : null}
      {preview ? (
        <div className="relative mt-3 aspect-video w-full max-h-48 overflow-hidden rounded-[var(--r-sm)] bg-bg-3">
          <Image
            src={preview}
            alt={medium.untertitel ?? 'Vorschaubild'}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      ) : null}
      {medium.typ === 'text' ? (
        <p className="mt-2 text-xs text-fg-3">Text im Medienfenster lesen</p>
      ) : null}
      {medium.typ === 'link' ? (
        <p className="mt-2 text-xs text-fg-3">Öffnet extern</p>
      ) : null}
      {(medium.typ === 'audio' || medium.typ === 'video') && (
        <p className="mt-2 text-xs text-fg-3">Tippen zum Abspielen</p>
      )}
    </>
  )

  const cardClass =
    'rounded-[var(--r-md)] border border-border-1 bg-bg-2 p-4 shadow-gs39-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-gs39-md'

  if (interactive) {
    return (
      <article className={cardClass}>
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

  return <article className={cardClass}>{body}</article>
}
