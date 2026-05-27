import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Gs39ButtonVariant = 'primary' | 'navy' | 'outline'

type Gs39ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Gs39ButtonVariant
  block?: boolean
  children: ReactNode
}

export function Gs39Button({
  variant = 'primary',
  block = false,
  className = '',
  type = 'button',
  children,
  ...rest
}: Gs39ButtonProps) {
  const variantClass =
    variant === 'navy'
      ? 'sn-btn--navy'
      : variant === 'outline'
        ? 'sn-btn--outline'
        : 'sn-btn--primary'

  return (
    <button
      type={type}
      className={['sn-btn', variantClass, block ? 'sn-btn--block' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
