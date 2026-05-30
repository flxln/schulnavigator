'use client'

import { useEffect, useRef } from 'react'
import type { EntryMode } from '@/lib/access-tokens'
import { markVisitedSlug } from '@/lib/visited-stations'

type StationVisitRecorderProps = {
  slug: string
  validSlugs: readonly string[]
  mode: EntryMode
}

export function StationVisitRecorder({
  slug,
  validSlugs,
  mode,
}: StationVisitRecorderProps) {
  const didMark = useRef(false)

  useEffect(() => {
    if (didMark.current) {
      return
    }
    didMark.current = true
    if (mode === 'fest') {
      return
    }
    markVisitedSlug(slug, new Set(validSlugs))
  }, [slug, validSlugs, mode])

  return null
}
