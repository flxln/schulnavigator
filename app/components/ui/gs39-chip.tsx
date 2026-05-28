import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react'

type Gs39ChipTone = 'navy' | 'green' | 'sun' | 'blue' | 'red' | 'ghost'

type Gs39ChipSize = 'sm' | 'md' | 'lg'

type Gs39ChipShared = {
  tone?: Gs39ChipTone
  size?: Gs39ChipSize
  children: ReactNode
  className?: string
}

type Gs39ChipDivProps = Gs39ChipShared &
  HTMLAttributes<HTMLDivElement> & {
    as?: 'div'
  }

type Gs39ChipButtonProps = Gs39ChipShared &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as: 'button'
  }

export type Gs39ChipProps = Gs39ChipDivProps | Gs39ChipButtonProps

function chipClasses(
  tone: Gs39ChipTone,
  size: Gs39ChipSize,
  className: string,
  asButton: boolean,
): string {
  const sizeClass =
    size === 'sm' ? 'sn-chip--sm' : size === 'lg' ? 'sn-chip--lg' : ''
  const toneClass = `sn-chip--${tone}`
  const buttonAffordance = asButton
    ? 'cursor-pointer transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
    : ''
  return ['sn-chip', sizeClass, toneClass, buttonAffordance, className]
    .filter(Boolean)
    .join(' ')
}

export function Gs39Chip(props: Gs39ChipProps) {
  const { tone = 'navy', size = 'md', className = '', children, as = 'div' } =
    props

  const classes = chipClasses(tone, size, className, as === 'button')

  if (as === 'button') {
    const buttonProps = props as Gs39ChipButtonProps
    const { tone: _t, size: _s, className: _c, children: _ch, as: _a, ...buttonRest } =
      buttonProps
    return (
      <button type="button" className={classes} {...buttonRest}>
        {children}
      </button>
    )
  }

  const divProps = props as Gs39ChipDivProps
  const { tone: _t, size: _s, className: _c, children: _ch, as: _a, ...divRest } =
    divProps
  return (
    <div className={classes} {...divRest}>
      {children}
    </div>
  )
}
