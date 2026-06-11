'use client'

import { useRouter } from 'next/navigation'
import { ScanFullscreenShell } from '@/components/scan/scan-fullscreen-shell'
import { QrScanner } from '@/components/scan/qr-scanner'

type Props = {
  origin: string
  trustedOrigins: readonly string[]
}

export function EintrittScanScreen({ origin, trustedOrigins }: Props) {
  const router = useRouter()

  return (
    <>
      <h1 className="sr-only">Eintritts-QR scannen</h1>
      <ScanFullscreenShell
        title="Eintritts-QR scannen"
        onBack={() => router.push('/eintritt')}
      >
        <QrScanner mode="entry" chrome={true} origin={origin} trustedOrigins={trustedOrigins} />
        <div className="max-w-xs text-center text-white">
          <p className="text-base font-extrabold">
            Halten Sie den Eintritts-QR in den Rahmen
          </p>
          <p className="mt-1 text-sm text-white/90">
            Am Eingang oder im Schulstartheft.
          </p>
        </div>
      </ScanFullscreenShell>
    </>
  )
}
