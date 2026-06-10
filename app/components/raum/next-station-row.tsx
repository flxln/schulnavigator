'use client'

import { Lock, QrCode } from 'lucide-react'
import { Gs39Chip } from '@/components/ui'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type NextStationRowVariant = 'card' | 'footer'

type NextStationRowProps = {
  station: HubStation
  locked: boolean
  eyebrow: string
  onClick: () => void
  variant: NextStationRowVariant
}

export function NextStationRow({
  station,
  locked,
  eyebrow,
  onClick,
  variant,
}: NextStationRowProps) {
  const baseClass =
    variant === 'card'
      ? 'mt-3.5 flex w-full items-center gap-2.5 rounded-[var(--r-md)] border-0 bg-bg-3 p-3 text-left'
      : 'flex w-full items-center gap-3 rounded-[var(--r-md)] border border-border-1 bg-bg-3 p-3 text-left'

  return (
    <button type="button" onClick={onClick} className={baseClass}>
      <Gs39Chip
        size="sm"
        className="!text-fg-on-dark"
        style={{
          background: locked ? 'var(--ink-40, #9ca3af)' : station.accent,
        }}
      >
        {locked ? (
          <Lock size={16} aria-hidden />
        ) : (
          <span className="text-sm font-extrabold">{station.nr}</span>
        )}
      </Gs39Chip>
      <span className="min-w-0 flex-1">
        <span className="t-eyebrow block text-[10px]">{eyebrow}</span>
        <span
          className={`block truncate text-sm text-fg-1 ${
            variant === 'footer' ? 'font-extrabold' : 'font-bold'
          }`}
        >
          {station.titel}
        </span>
      </span>
      {variant === 'footer' ? (
        locked ? (
          <QrCode size={20} className="shrink-0 text-fg-1" aria-hidden />
        ) : (
          <span className="shrink-0 text-fg-1" aria-hidden>
            →
          </span>
        )
      ) : null}
    </button>
  )
}
