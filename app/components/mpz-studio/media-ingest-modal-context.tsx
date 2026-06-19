'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { MediaIngestModal } from '@/components/mpz-studio/media-ingest-modal'
import type { MediumTyp } from '@/lib/types'

export type OpenMediaIngestOptions = {
  slug?: string
  initialTyp?: MediumTyp
}

type MediaIngestModalContextValue = {
  openMediaIngest: (opts?: OpenMediaIngestOptions) => void
}

const MediaIngestModalContext = createContext<MediaIngestModalContextValue | null>(
  null,
)

export function MediaIngestModalProvider({
  children,
  globalSuffixes,
}: {
  children: ReactNode
  globalSuffixes: readonly string[]
}) {
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState<string | undefined>()
  const [initialTyp, setInitialTyp] = useState<MediumTyp | undefined>()

  const openMediaIngest = useCallback((opts?: OpenMediaIngestOptions) => {
    setSlug(opts?.slug)
    setInitialTyp(opts?.initialTyp)
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <MediaIngestModalContext.Provider value={{ openMediaIngest }}>
      {children}
      <MediaIngestModal
        open={open}
        slug={slug}
        initialTyp={initialTyp}
        globalSuffixes={globalSuffixes}
        onClose={handleClose}
      />
    </MediaIngestModalContext.Provider>
  )
}

export function useMediaIngest(): MediaIngestModalContextValue {
  const ctx = useContext(MediaIngestModalContext)
  if (!ctx) {
    throw new Error('useMediaIngest must be used within MediaIngestModalProvider')
  }
  return ctx
}
