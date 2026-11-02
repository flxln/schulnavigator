import type { HTMLAttributes, ReactNode } from 'react'
import { MPZ_STUDIO_THEME_BUILD_SMOKE } from '@/components/mpz-studio/mpz-studio-theme-build-smoke'

void MPZ_STUDIO_THEME_BUILD_SMOKE

export type MpzCardVariant = 'default' | 'validation'
export type MpzCardPadding = 'default' | 'none'

export type MpzCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: MpzCardVariant
  padding?: MpzCardPadding
  children: ReactNode
}

export function MpzCard({
  variant = 'default',
  padding = 'default',
  className = '',
  children,
  ...rest
}: MpzCardProps) {
  return (
    <div
      className={[
        'rounded-mpz-card border border-border-1 bg-bg-2',
        padding === 'default' ? 'p-mpz-card-padding' : '',
        variant === 'validation' ? 'border-l-4 border-l-accent' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
