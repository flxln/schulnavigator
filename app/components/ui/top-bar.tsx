import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

type TopBarProps = {
  title: string
  onBack?: () => void
  right?: ReactNode
  dark?: boolean
  tight?: boolean
}

export function TopBar({
  title,
  onBack,
  right,
  dark = false,
  tight = false,
}: TopBarProps) {
  const pad = tight ? 'py-1.5' : 'py-2.5'
  const textColor = dark ? 'text-fg-on-dark' : 'text-fg-1'
  const btnBg = dark ? 'bg-white/15' : 'bg-brand-navy/10'

  return (
    <div
      className={`relative z-[2] flex items-center gap-2 px-3.5 ${pad} ${textColor}`}
    >
      {onBack ? (
        <button
          type="button"
          aria-label="Zurück"
          onClick={onBack}
          className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border-0 ${btnBg} cursor-pointer`}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
      ) : (
        <div className="w-[38px] shrink-0" aria-hidden />
      )}
      <div className="min-w-0 flex-1 truncate text-center text-[17px] font-extrabold tracking-wide">
        {title}
      </div>
      <div className="flex w-[38px] shrink-0 justify-end">{right}</div>
    </div>
  )
}
