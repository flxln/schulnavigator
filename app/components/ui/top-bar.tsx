import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { topBarMirrorWidthClass } from '@/lib/ui/top-bar-layout'

type TopBarProps = {
  title: string
  onBack?: () => void
  leftExtra?: ReactNode
  right?: ReactNode
  dark?: boolean
  tight?: boolean
}

export function TopBar({
  title,
  onBack,
  leftExtra,
  right,
  dark = false,
  tight = false,
}: TopBarProps) {
  const pad = tight ? 'py-1.5' : 'py-2.5'
  const textColor = dark ? 'text-fg-on-dark' : 'text-fg-1'
  const btnBg = dark ? 'bg-white/15' : 'bg-brand-navy/10'
  const sideWidth = topBarMirrorWidthClass(Boolean(leftExtra))

  return (
    <div
      className={`relative z-[2] flex items-center gap-2 px-3.5 ${pad} ${textColor}`}
    >
      <div className="flex shrink-0 items-center gap-2">
        {onBack ? (
          <button
            type="button"
            aria-label="Zurück"
            onClick={onBack}
            className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border-0 ${btnBg} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`}
          >
            <ArrowLeft size={20} aria-hidden />
          </button>
        ) : (
          <div className="h-[38px] w-[38px] shrink-0" aria-hidden />
        )}
        {leftExtra}
      </div>
      <div className="min-w-0 flex-1 truncate text-center text-[17px] font-extrabold tracking-wide">
        {title}
      </div>
      <div className={`flex ${sideWidth} shrink-0 justify-end`}>{right}</div>
    </div>
  )
}
