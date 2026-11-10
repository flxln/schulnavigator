type Gs39ChipMarkProps = {
  className?: string
  label?: string
}

export function Gs39ChipMark({ className = '', label = '39.' }: Gs39ChipMarkProps) {
  return (
    <span
      className={`font-display text-lg font-black leading-none tracking-wide text-white normal-case ${className}`}
      aria-hidden
    >
      {label}
    </span>
  )
}
