'use client'

import { QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Gs39Button } from '@/components/ui'
import { unlockAudioPlayback } from '@/lib/audio-autoplay-unlock'

export function HomeFestScanCta() {
  const router = useRouter()

  return (
    <Gs39Button
      block
      className="gap-2.5"
      onClick={() => {
        unlockAudioPlayback()
        router.push('/scan')
      }}
    >
      <QrCode size={22} aria-hidden />
      Scanne die nächste Station!
    </Gs39Button>
  )
}
