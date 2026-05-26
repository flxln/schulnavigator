'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  countVisited,
  markVisitedSlug,
  readVisitedSlugsFromStorage,
  VISITED_CHANGED_EVENT,
  VISITED_SLUGS_STORAGE_KEY,
} from '@/lib/visited-stations'

export function useVisitedStations(validSlugs: readonly string[]) {
  const validSlugSet = useMemo(() => new Set(validSlugs), [validSlugs])
  const [visitedList, setVisitedList] = useState<readonly string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  const syncFromStorage = useCallback(() => {
    setVisitedList(readVisitedSlugsFromStorage(validSlugSet))
    setIsHydrated(true)
  }, [validSlugSet])

  useEffect(() => {
    syncFromStorage()
  }, [syncFromStorage])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== VISITED_SLUGS_STORAGE_KEY) {
        return
      }
      syncFromStorage()
    }
    const onVisited = () => syncFromStorage()
    const onPageShow = () => syncFromStorage()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(VISITED_CHANGED_EVENT, onVisited)
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(VISITED_CHANGED_EVENT, onVisited)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [syncFromStorage])

  const visitedSlugs = useMemo(() => new Set(visitedList), [visitedList])
  const visitedCount = useMemo(
    () => countVisited(visitedList, validSlugSet),
    [visitedList, validSlugSet],
  )

  const markVisited = useCallback(
    (slug: string) => {
      markVisitedSlug(slug, validSlugSet)
      syncFromStorage()
    },
    [validSlugSet, syncFromStorage],
  )

  return {
    visitedSlugs,
    visitedCount,
    markVisited,
    isHydrated,
  }
}
