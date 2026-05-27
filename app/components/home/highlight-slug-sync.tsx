'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type HighlightSlugSyncProps = {
  highlight?: string
}

/** Entfernt ?highlight= aus der URL nach Anzeige der Hub-Animation (ADR-009, L5). */
export function HighlightSlugSync({ highlight }: HighlightSlugSyncProps) {
  const router = useRouter()

  useEffect(() => {
    if (!highlight) return
    const timer = window.setTimeout(() => {
      router.replace('/', { scroll: false })
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [highlight, router])

  return null
}
