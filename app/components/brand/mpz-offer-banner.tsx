type MpzOfferBannerProps = {
  className?: string
}

export function MpzOfferBanner({ className }: MpzOfferBannerProps) {
  return (
    <div
      className={['flex flex-col items-center gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
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
  )
}
