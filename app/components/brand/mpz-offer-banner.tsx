type MpzOfferBannerProps = {
  className?: string
}

export function MpzOfferBanner({ className }: MpzOfferBannerProps) {
  return (
    <div
      className={['flex w-full flex-col items-stretch gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="text-center text-[0.65rem] uppercase tracking-widest text-fg-3/60">
        Ein Angebot des
      </p>
      <a
        href="https://mpz.schule"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-full min-h-12 items-center justify-center gap-3 rounded-[var(--r-md)] border border-border-1 bg-bg-2/70 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-sm transition hover:border-border-2 hover:shadow-[var(--shadow-md)]"
        aria-label="Medienpädagogisches Zentrum Dresden"
      >
        <img
          src="/brand/logos/mpz-logo.png"
          alt=""
          aria-hidden
          className="h-7 w-auto shrink-0 object-contain"
        />
        <span className="text-sm font-bold leading-tight tracking-tight text-fg-2 transition group-hover:text-fg-1">
          Medienpädagogisches Zentrum
        </span>
      </a>
    </div>
  )
}
