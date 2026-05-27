import type { HTMLAttributes, ReactNode } from 'react'

type Gs39CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
  locked?: boolean
  children: ReactNode
}

export function Gs39Card({
  interactive = false,
  locked = false,
  className = '',
  children,
  ...rest
}: Gs39CardProps) {
  return (
    <div
      className={[
        'sn-card',
        interactive && !locked ? 'sn-card--interactive' : '',
        locked ? 'sn-card--locked' : '',
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
