'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export type MpzModalProps = {
  open: boolean
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function MpzModal({
  open,
  title,
  titleId,
  onClose,
  children,
  footer,
  className = 'w-[min(100%,42rem)]',
}: MpzModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 z-50 m-auto hidden max-h-[90vh] flex-col overflow-hidden rounded-gs39-md border border-border-1 bg-bg-2 p-0 shadow-gs39-lg backdrop:bg-black/40 open:flex ${className}`}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-1 bg-bg-2 px-5 py-4">
        <h2 id={titleId} className="text-lg font-bold text-fg-1">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-gs39-sm px-2 py-1 text-sm font-semibold text-fg-3 hover:bg-bg-1 hover:text-fg-1"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">{children}</div>
      {footer ? (
        <div className="sticky bottom-0 border-t border-border-1 bg-bg-2 px-5 py-4">
          {footer}
        </div>
      ) : null}
    </dialog>
  )
}
