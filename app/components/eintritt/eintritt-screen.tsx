import Link from 'next/link'
import { AlertCircle, QrCode } from 'lucide-react'
import { MpzOfferBanner } from '@/components/brand/mpz-offer-banner'
import { EintrittScanLink } from '@/components/eintritt/eintritt-scan-link'
import { FestiveDecor, Gs39Chip, Gs39ChipMark } from '@/components/ui'
import { IS_DEMO_INSTANCE, instanceCopy } from '@/lib/instance-profile'

export type EintrittVariant = 'fresh' | 'expired' | 'wrong'

type EintrittScreenProps = {
  variant?: EintrittVariant
}

function mapReasonToVariant(reason: string | undefined): EintrittVariant {
  if (reason === 'expired') return 'expired'
  if (reason === 'invalid') return 'wrong'
  return 'fresh'
}

export function eintrittVariantFromReason(
  reason: string | undefined,
): EintrittVariant {
  return mapReasonToVariant(reason)
}

export function EintrittScreen({ variant = 'fresh' }: EintrittScreenProps) {
  const isError = variant !== 'fresh'

  return (
    <div className="sn-fade-in relative flex flex-col gap-6">
      <FestiveDecor className="-inset-x-4" />

      <div className="relative z-[1] flex items-center gap-2 pt-1">
        <Gs39Chip
          tone="navy"
          size="sm"
          className="!w-auto min-w-10 px-1.5"
          aria-label={instanceCopy.chipAria}
        >
          <Gs39ChipMark label={instanceCopy.chipMark} />
        </Gs39Chip>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight text-fg-1">
            Schulnavigator
          </p>
          <p className="text-[11px] text-fg-3">{instanceCopy.homeName}</p>
        </div>
      </div>

      <div className="relative z-[1] mt-10">
        {IS_DEMO_INSTANCE ? (
          <>
            <p className="t-script text-[28px] leading-none text-fg-1">Willkommen zur</p>
            <h1 className="sn-brush mt-2.5 text-[46px] leading-[1.05]">Demo</h1>
            <p className="t-script mt-11 text-xl leading-snug text-fg-2">
              Beispielrundgang mit erfundenen Texten und Bildern.
            </p>
          </>
        ) : (
          <>
            <p className="t-script text-[28px] leading-none text-fg-1">Willkommen am</p>
            <h1 className="sn-brush mt-2.5 text-[46px] leading-[1.05]">Tag der</h1>
            <p className="pt-1">
              <span className="sn-brush-hl sn-brush text-[46px] leading-[1.05]">offenen Tür</span>
            </p>
            <p className="t-script mt-11 text-xl leading-snug text-fg-2">
              Gemeinsam feiern. Erinnern.
              <br />
              Zukunft gestalten.
            </p>
          </>
        )}
      </div>

      {!isError ? (
        <EintrittScanLink />
      ) : (
        <div
          className="relative z-[1] rounded-[var(--r-lg)] border-[1.5px] border-brand-red bg-[#fff5f5] p-5 shadow-[var(--shadow-md)]"
          role="alert"
        >
          <div className="mb-3 flex items-center gap-3.5">
            <Gs39Chip tone="red">
              <AlertCircle size={26} aria-hidden className="text-fg-on-dark" />
            </Gs39Chip>
            <div>
              <h2 className="text-lg font-extrabold text-brand-red">
                {variant === 'expired'
                  ? 'Zugang abgelaufen'
                  : 'Code nicht erkannt'}
              </h2>
              <p className="text-sm text-fg-3">
                {variant === 'expired'
                  ? 'Dieser Eintritts-QR ist nicht mehr gültig.'
                  : instanceCopy.eintrittWrong}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-fg-2">
            {IS_DEMO_INSTANCE
              ? 'Der Link gehört nicht zu dieser Demo.'
              : 'Sprechen Sie uns am Eingang an — wir helfen gern weiter und drucken bei Bedarf einen neuen Code aus.'}
          </p>
          <Link
            href="/eintritt/scan"
            className="sn-btn sn-btn--primary sn-btn--block gap-2"
          >
            <QrCode size={20} aria-hidden />
            Erneut scannen
          </Link>
        </div>
      )}

      {variant === 'fresh' ? (
        <p className="relative z-[1] text-center text-[11px] leading-relaxed text-fg-3">
          Mit gültigem Eintritts-QR setzen wir ein technisch notwendiges Cookie
          für den Zugang. Details in der{' '}
          <Link
            href="/datenschutz"
            className="font-medium text-brand-green underline underline-offset-2"
          >
            Datenschutzerklärung
          </Link>
          .
        </p>
      ) : null}

      <MpzOfferBanner className="relative z-[1]" />
    </div>
  )
}
