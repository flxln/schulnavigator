'use client'

import { useEffect, useRef } from 'react'
import { markVisitedSlug } from '@/lib/visited-stations'

type StationVisitRecorderProps = {
  slug: string
  validSlugs: readonly string[]
}

export function StationVisitRecorder({
  slug,
  validSlugs,
}: StationVisitRecorderProps) {
  const didMark = useRef(false)

  useEffect(() => {
    if (didMark.current) {
      return
    }
    didMark.current = true
    const validSlugSet = new Set(validSlugs)
    markVisitedSlug(slug, validSlugSet)
  }, [slug, validSlugs])

  return null
}
