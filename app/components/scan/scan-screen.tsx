'use client'

import { useRouter } from 'next/navigation'
import { ScanFullscreenShell } from '@/components/scan/scan-fullscreen-shell'
import { QrScanner } from '@/components/scan/qr-scanner'

type ScanScreenProps = {
  origin: string
  trustedOrigins: readonly string[]
  slugs: readonly string[]
}

export function ScanScreen({ origin, trustedOrigins, slugs }: ScanScreenProps) {
  const router = useRouter()

  return (
    <>
      <h1 className="sr-only">Raum-QR scannen</h1>
      <ScanFullscreenShell title="Raum-QR scannen" onBack={() => router.push('/')}>
        <QrScanner
          mode="room"
          chrome={true}
          origin={origin}
          trustedOrigins={trustedOrigins}
          slugs={slugs}
        />
        <div className="max-w-xs text-center text-white">
          <p className="text-base font-extrabold">
            Halten Sie den Raum-QR in den Rahmen
          </p>
          <p className="mt-1 text-sm text-white/90">
            Nur Codes der 39. Grundschule werden akzeptiert.
          </p>
        </div>
      </ScanFullscreenShell>
    </>
  )
}
