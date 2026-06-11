type Gs39ChipMarkProps = {
  className?: string
}

export function Gs39ChipMark({ className = '' }: Gs39ChipMarkProps) {
  return (
    <span
      className={`font-display text-lg font-black leading-none tracking-wide text-white normal-case ${className}`}
      aria-hidden
    >
      39.
    </span>
  )
}
