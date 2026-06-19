'use client'

import { useEffect } from 'react'
import { useMediaIngest } from '@/components/mpz-studio/media-ingest-modal-context'

export type MpzStudioIngestOpenerProps = {
  slug?: string
}

export function MpzStudioIngestOpener({ slug }: MpzStudioIngestOpenerProps) {
  const { openMediaIngest } = useMediaIngest()

  useEffect(() => {
    openMediaIngest({ slug })
  }, [openMediaIngest, slug])

  return (
    <p className="text-sm text-fg-2">
      Medien-Dialog wird geöffnet … Falls nichts erscheint, nutze „Medien hochladen“ in der
      Seitenleiste.
    </p>
  )
}
