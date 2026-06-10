'use client'

import { Lock, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Gs39Chip } from '@/components/ui'
import type { HubStation } from '@/lib/schoolhouse-hub-map'

type HomeFestScanCtaProps = {
  nextStation: HubStation
}

export function HomeFestScanCta({ nextStation }: HomeFestScanCtaProps) {
  const router = useRouter()

  return (
    <button
      type="button"
      className="sn-btn sn-btn--primary sn-btn--split sn-btn--block"
      onClick={() => router.push('/scan')}
      aria-label={`QR-Scanner starten, empfohlen: ${nextStation.titel}`}
    >
      <span className="sn-btn-split__zone min-w-0 flex-1">
        <Gs39Chip
          size="sm"
          className="!text-fg-on-dark shrink-0"
          style={{ background: 'var(--ink-40, #9ca3af)' }}
        >
          <Lock size={16} aria-hidden />
        </Gs39Chip>
        <span className="min-w-0 flex-1 text-left">
          <span className="t-eyebrow block text-[10px] text-white/80">
            Nächste Station
          </span>
          <span className="block truncate text-sm font-bold">
            {nextStation.titel}
          </span>
        </span>
      </span>
      <span className="sn-btn-split__zone min-w-0 flex-1 flex-col items-start justify-center gap-0.5 text-left">
        <span className="t-eyebrow block text-[10px] text-white/80">
          Beliebiger QR
        </span>
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <QrCode size={18} aria-hidden />
          scannen
        </span>
      </span>
    </button>
  )
}
