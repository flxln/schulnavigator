import { Check, Lock, Play, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

export type Gs39ToastIcon = 'lock' | 'play' | 'check' | 'sparkle' | 'none'

type Gs39ToastProps = {
  message: string
  icon?: Gs39ToastIcon
  className?: string
}

function ToastIcon({ icon }: { icon: Gs39ToastIcon }) {
  const props = { size: 14, 'aria-hidden': true as const }
  switch (icon) {
    case 'lock':
      return <Lock {...props} color="#fff" />
    case 'play':
      return <Play {...props} color="#fff" />
    case 'check':
      return <Check {...props} color="#fff" />
    case 'sparkle':
      return <Sparkles {...props} color="var(--brand-sun)" />
    default:
      return null
  }
}

export function Gs39Toast({
  message,
  icon = 'none',
  className = '',
}: Gs39ToastProps) {
  return (
    <div
      className={`sn-toast ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      {icon !== 'none' ? <ToastIcon icon={icon} /> : null}
      <span>{message}</span>
    </div>
  )
}

/** Container für Toast-Overlay (fixed, volle Viewport-Breite) */
export function Gs39ToastLayer({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">{children}</div>
  )
}
