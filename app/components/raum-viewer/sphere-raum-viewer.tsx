'use client'

import dynamic from 'next/dynamic'
import { forwardRef } from 'react'
import type { StationViewerHandle } from '@/lib/types'
import type { SphereRaumViewerInnerProps } from '@/components/raum-viewer/sphere-raum-viewer-inner'
import type { RaumViewerLayout } from '@/components/raum-viewer/raum-viewer'

const SphereRaumViewerInner = dynamic(
  () =>
    import('@/components/raum-viewer/sphere-raum-viewer-inner').then(
      (m) => m.SphereRaumViewerInner,
    ),
  {
    ssr: false,
    loading: ({ isLoading }) =>
      isLoading ? <SphereLoadingPlaceholder /> : null,
  },
)

export type SphereRaumViewerProps = SphereRaumViewerInnerProps

export const SphereRaumViewer = forwardRef<
  StationViewerHandle,
  SphereRaumViewerProps
>(function SphereRaumViewer(props, ref) {
  return <SphereRaumViewerInner {...props} ref={ref} />
})

SphereRaumViewer.displayName = 'SphereRaumViewer'

function SphereLoadingPlaceholder({ layout }: { layout?: RaumViewerLayout }) {
  const isHero = layout === 'hero'
  return (
    <div
      className={`flex w-full animate-pulse items-center justify-center bg-bg-dark ${isHero ? 'h-full' : 'sn-viewer-fallback-height rounded-[var(--r-md)]'}`}
      aria-label="Raum wird geladen…"
    />
  )
}
