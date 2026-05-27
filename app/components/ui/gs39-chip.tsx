import type { HTMLAttributes, ReactNode } from 'react'

type Gs39ChipTone = 'navy' | 'green' | 'sun' | 'blue' | 'red' | 'ghost'

type Gs39ChipSize = 'sm' | 'md' | 'lg'

type Gs39ChipProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Gs39ChipTone
  size?: Gs39ChipSize
  children: ReactNode
}

export function Gs39Chip({
  tone = 'navy',
  size = 'md',
  className = '',
  children,
  ...rest
}: Gs39ChipProps) {
  const sizeClass =
    size === 'sm' ? 'sn-chip--sm' : size === 'lg' ? 'sn-chip--lg' : ''
  const toneClass = `sn-chip--${tone}`

  return (
    <div
      className={['sn-chip', sizeClass, toneClass, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
