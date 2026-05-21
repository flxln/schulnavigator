import type { Medium } from '@/lib/types'
import { MediaSlot } from '@/components/media-slot'

export type MediaSlotListProps = {
  medien: Medium[]
  onMediaSelect?: (medium: Medium) => void
}

export function MediaSlotList({ medien, onMediaSelect }: MediaSlotListProps) {
  if (medien.length === 0) {
    return (
      <section id="medien" aria-labelledby="medien-heading" className="mt-2">
        <h2 id="medien-heading" className="text-lg font-semibold text-zinc-900">
          Medien
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Hier kommen später Audio, Video und Fotos der Kinder.
        </p>
      </section>
    )
  }

  return (
    <section id="medien" aria-labelledby="medien-heading" className="mt-2">
      <h2 id="medien-heading" className="text-lg font-semibold text-zinc-900">
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
