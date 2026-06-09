import type { Medium } from '@/lib/types'
import { MediaSlot } from '@/components/media-slot'
import { GS39_BRAND_HEX } from '@/lib/gs39-brand-colors'

export type MediaSlotListProps = {
  medien: Medium[]
  onMediaSelect?: (medium: Medium) => void
  accent?: string
  variant?: 'default' | 'station'
}

const MEDIA_TILE_BG: Record<Medium['typ'], string> = {
  audio: '#E4F3FC',
  video: '#FFF1DA',
  foto: '#E9F5DD',
  text: '#F0EAD9',
}

export function MediaSlotList({
  medien,
  onMediaSelect,
  accent = GS39_BRAND_HEX.navy,
  variant = 'default',
}: MediaSlotListProps) {
  if (medien.length === 0) {
    return (
      <section id="medien" aria-labelledby="medien-heading" className="mt-2">
        <h2 id="medien-heading" className="text-lg font-semibold text-fg-1">
          Medien
        </h2>
        <p className="mt-2 text-sm text-fg-2">
          Hier kommen später Audio, Video und Fotos der Kinder.
        </p>
      </section>
    )
  }

  if (variant === 'station') {
    return (
      <section id="medien" aria-labelledby="medien-heading">
        <h2 id="medien-heading" className="t-eyebrow text-[11px]">
          Medien · {medien.length}
        </h2>
        <ul className="mt-2.5 flex flex-col gap-2.5">
          {medien.map((medium) => (
            <li key={medium.id}>
              <button
                type="button"
                onClick={() => onMediaSelect?.(medium)}
                className="sn-card sn-card--interactive flex w-full items-center gap-3 p-3 text-left"
              >
                <div
                  className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[var(--r-sm)]"
                  style={{
                    background:
                      MEDIA_TILE_BG[medium.typ] ?? GS39_BRAND_HEX.paper50,
                    color: accent,
                  }}
                >
                  <span className="text-xs font-extrabold uppercase">
                    {medium.typ}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-fg-1">
                    {medium.untertitel ?? medium.typ}
                  </p>
                  <p className="mt-0.5 text-xs text-fg-3">
                    {medium.typ === 'text' ? 'Tippen zum Lesen' : 'Tippen zum Abspielen'}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section id="medien" aria-labelledby="medien-heading" className="mt-2">
      <h2 id="medien-heading" className="text-lg font-semibold text-fg-1">
        Medien
      </h2>
      <ul className="mt-4 flex flex-col gap-3">
        {medien.map((medium) => (
          <li key={medium.id}>
            <MediaSlot medium={medium} onMediaSelect={onMediaSelect} />
          </li>
        ))}
      </ul>
    </section>
  )
}
