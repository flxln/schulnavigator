'use client'

import Link from 'next/link'
import { QrCode } from 'lucide-react'
import { Gs39Chip } from '@/components/ui'
import { unlockAudioPlayback } from '@/lib/audio-autoplay-unlock'

export function EintrittScanLink() {
  return (
    <Link
      href="/eintritt/scan"
      className="sn-card sn-card--interactive relative z-[1] block p-5 text-left shadow-[var(--shadow-md)]"
      aria-label="Eintritts-QR scannen, Kamera starten"
      onClick={() => unlockAudioPlayback()}
    >
      <div className="mb-3.5 flex items-center gap-3.5">
        <Gs39Chip tone="green">
          <QrCode size={28} aria-hidden className="text-fg-on-dark" />
        </Gs39Chip>
        <div>
          <h2 className="text-lg font-extrabold text-fg-1">
            Eintritts-QR scannen
          </h2>
          <p className="text-sm text-fg-3">Am Schultor oder im Schulstartheft.</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-fg-2">
        Tippen Sie hier — die Kamera startet in der App. Kein App-Store nötig.
      </p>
    </Link>
  )
}
