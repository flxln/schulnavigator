'use client'

import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/ui/top-bar'
import { QrScanner } from '@/components/scan/qr-scanner'

type ScanScreenProps = {
  origin: string
  slugs: readonly string[]
}

export function ScanScreen({ origin, slugs }: ScanScreenProps) {
  const router = useRouter()

  return (
    <div className="sn-fade-in relative flex min-h-[100dvh] flex-col bg-black">
      <TopBar
        dark
        title="Raum-QR scannen"
        onBack={() => router.push('/')}
        tight
      />

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <QrScanner mode="room" chrome={true} origin={origin} slugs={slugs} />

        <div className="max-w-xs text-center text-fg-on-dark">
          <p className="text-base font-extrabold">
            Halten Sie den Raum-QR in den Rahmen
          </p>
          <p className="mt-1 text-sm text-white/75">
            Nur Codes der 39. Grundschule werden akzeptiert.
          </p>
        </div>
      </div>
    </div>
  )
}
