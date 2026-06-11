import Link from 'next/link'
import { AlertCircle, QrCode } from 'lucide-react'
import { FestiveDecor, Gs39Chip, Gs39ChipMark } from '@/components/ui'

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
          aria-label="39. Grundschule Dresden-Plauen"
        >
          <Gs39ChipMark />
        </Gs39Chip>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight text-fg-1">
            Schulnavigator
          </p>
          <p className="text-[11px] text-fg-3">39. Grundschule Dresden-Plauen</p>
        </div>
      </div>

      <div className="relative z-[1] mt-10">
        <p className="t-script text-[28px] leading-none text-fg-1">
          Willkommen am
        </p>
        <h1 className="sn-brush mt-2.5 text-[46px] leading-[1.05]">
          Tag der
        </h1>
        <p className="pt-1">
          <span className="sn-brush-hl sn-brush text-[46px] leading-[1.05]">
            offenen Tür
          </span>
        </p>
        <p className="t-script mt-11 text-xl leading-snug text-fg-2">
          Gemeinsam feiern. Erinnern.
          <br />
          Zukunft gestalten.
        </p>
      </div>

      {!isError ? (
        <Link
          href="/eintritt/scan"
          className="sn-card sn-card--interactive relative z-[1] block p-5 text-left shadow-[var(--shadow-md)]"
          aria-label="Eintritts-QR scannen, Kamera starten"
        >
          <div className="mb-3.5 flex items-center gap-3.5">
            <Gs39Chip tone="green">
              <QrCode size={28} aria-hidden className="text-fg-on-dark" />
            </Gs39Chip>
            <div>
              <h2 className="text-lg font-extrabold text-fg-1">
                Eintritts-QR scannen
              </h2>
              <p className="text-sm text-fg-3">
                Am Schultor oder im Schulstartheft.
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-fg-2">
            Tippen Sie hier — die Kamera startet in der App. Kein App-Store nötig.
          </p>
        </Link>
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
                  : 'Das ist kein Eintritts-QR der 39. Grundschule.'}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-fg-2">
            Sprechen Sie uns am Eingang an — wir helfen gern weiter und drucken
            bei Bedarf einen neuen Code aus.
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

      <div className="relative z-[1] flex flex-col items-center gap-1.5">
        <p className="text-center text-[0.6rem] uppercase tracking-widest text-fg-3/60">
          Ein Angebot des
        </p>
        <a
          href="https://mpz.schule"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 rounded-full border border-border-1 bg-bg-2/70 px-3 py-1.5 shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:border-border-2 hover:shadow-[var(--shadow-md)]"
          aria-label="Medienpädagogisches Zentrum Dresden"
        >
          <img
            src="/brand/logos/mpz-logo.png"
            alt=""
            aria-hidden
            className="h-5 w-auto shrink-0 object-contain"
          />
          <span className="text-[0.72rem] font-semibold leading-none tracking-tight text-fg-2 transition group-hover:text-fg-1">
            Medienpädagogisches Zentrum
          </span>
        </a>
      </div>
    </div>
  )
}
