'use client'

import type { ReactNode } from 'react'

export type MpzFormAlertVariant = 'error' | 'success' | 'info'

export type MpzFormAlertProps = {
  variant: MpzFormAlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const VARIANT_STYLES: Record<MpzFormAlertVariant, string> = {
  error: 'border-error/40 bg-error/10',
  success: 'border-accent/40 bg-accent/10',
  info: 'border-border-1 bg-bg-2',
}

export function MpzFormAlert({
  variant,
  title,
  children,
  className = '',
}: MpzFormAlertProps) {
  const role = variant === 'error' ? 'alert' : 'status'

  return (
    <div
      role={role}
      className={`rounded-gs39-sm border px-3 py-2 text-sm text-fg-1 ${VARIANT_STYLES[variant]} ${className}`}
    >
      {title ? (
        <p className={`font-semibold ${variant === 'error' ? 'text-error' : 'text-fg-1'}`}>
          {title}
        </p>
      ) : null}
      <div className={title ? 'mt-1 text-fg-2' : 'text-fg-2'}>{children}</div>
    </div>
  )
}

export type MpzDraftNoticeProps = {
  children?: ReactNode
  className?: string
}

export function MpzDraftNotice({
  children = 'Änderungen noch nicht gespeichert — Button „Speichern“ im Bereich nutzen.',
  className = '',
}: MpzDraftNoticeProps) {
  return (
    <div
      role="status"
      className={`rounded-gs39-sm border border-warn/50 bg-warn/15 px-3 py-2 text-sm text-fg-1 ${className}`}
    >
      {children}
    </div>
  )
}
