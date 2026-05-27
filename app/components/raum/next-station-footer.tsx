'use client'

import { Lock, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Gs39Chip } from '@/components/ui'
import type { EntryMode } from '@/lib/access-tokens'
import { isHubStationNavigable } from '@/lib/hub-mode'
import type { IsometricHubStation } from '@/lib/schoolhouse-isometric-map'

type NextStationFooterProps = {
  currentSlug: string
  hubStations: readonly IsometricHubStation[]
  mode: EntryMode
  unlockedSlugs: ReadonlySet<string>
}

export function NextStationFooter({
  currentSlug,
  hubStations,
  mode,
  unlockedSlugs,
}: NextStationFooterProps) {
  const router = useRouter()

  const idx = hubStations.findIndex((s) => s.slug === currentSlug)
  if (idx < 0 || hubStations.length === 0) return null

  const next = hubStations[(idx + 1) % hubStations.length]
  if (!next) return null

  const locked =
    mode === 'fest' && !isHubStationNavigable(next.slug, unlockedSlugs)

  const onClick = () => {
    if (locked) {
      router.push('/scan')
      return
    }
    router.push(`/raum/${next.slug}`)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[var(--r-md)] border border-border-1 bg-bg-3 p-3 text-left"
    >
      <Gs39Chip
        size="sm"
        className="!text-fg-on-dark"
        style={{
          background: locked ? 'var(--ink-40, #9ca3af)' : next.accent,
        }}
      >
        {locked ? (
          <Lock size={16} aria-hidden />
        ) : (
          <span className="text-sm font-extrabold">{next.nr}</span>
        )}
      </Gs39Chip>
      <span className="min-w-0 flex-1">
        <span className="t-eyebrow block text-[10px]">
          {locked ? 'Nächste Station' : 'Weiter zu'}
        </span>
        <span className="block truncate text-sm font-extrabold text-fg-1">
          {next.titel}
        </span>
      </span>
      {locked ? (
        <QrCode size={20} className="shrink-0 text-fg-1" aria-hidden />
      ) : (
        <span className="shrink-0 text-fg-1" aria-hidden>
          →
        </span>
      )}
    </button>
  )
}
