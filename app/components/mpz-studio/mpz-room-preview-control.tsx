import type { ReactNode } from 'react'

type MpzRoomPreviewControlProps = {
  href: string
  children: ReactNode
  className?: string
}

export function MpzRoomPreviewControl({
  href,
  children,
  className,
}: MpzRoomPreviewControlProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
