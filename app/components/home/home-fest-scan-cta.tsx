'use client'

import { QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MpzOfferBanner } from '@/components/brand/mpz-offer-banner'
import { Gs39Button } from '@/components/ui'
import { unlockAudioPlayback } from '@/lib/audio-autoplay-unlock'

export function HomeFestScanCta() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
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
      <MpzOfferBanner />
    </div>
  )
}
