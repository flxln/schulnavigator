'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

export type MpzModalProps = {
  open: boolean
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
}

function applySafariDialogGrid(dialog: HTMLDialogElement): void {
  dialog.style.display = 'grid'
}

function hideClosedDialog(dialog: HTMLDialogElement): void {
  // Safari: inline display:grid überlebt dialog.close() und hält das Modal sichtbar.
  dialog.style.display = 'none'
}

function openMpzDialog(dialog: HTMLDialogElement): void {
  dialog.showModal()
  applySafariDialogGrid(dialog)
}

function closeMpzDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) {
    dialog.close()
  }
  hideClosedDialog(dialog)
}

export function MpzModal({
  open,
  title,
  titleId,
  onClose,
  children,
  footer,
  className = '',
}: MpzModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleDismiss = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog) {
      closeMpzDialog(dialog)
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) {
        openMpzDialog(dialog)
      } else {
        applySafariDialogGrid(dialog)
      }
    } else {
      closeMpzDialog(dialog)
    }
  }, [open])

  const gridRowsClass = footer
    ? 'grid-rows-[auto_minmax(0,1fr)_auto]'
    : 'grid-rows-[auto_minmax(0,1fr)]'

  return (
    <dialog
      ref={dialogRef}
      className={`mpz-modal fixed top-1/2 left-1/2 z-50 m-0 grid w-[min(100%,42rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 ${gridRowsClass} overflow-hidden rounded-gs39-md border border-border-1 bg-bg-2 p-0 shadow-gs39-lg backdrop:bg-black/40 ${className}`}
      aria-labelledby={titleId}
      onClose={handleDismiss}
    >
      <div className="flex items-center justify-between border-b border-border-1 bg-bg-2 px-5 py-4">
        <h2 id={titleId} className="text-lg font-bold text-fg-1">
          {title}
        </h2>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-gs39-sm px-2 py-1 text-sm font-semibold text-fg-3 hover:bg-bg-1 hover:text-fg-1"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>
      <div className="mpz-modal__body overflow-y-auto p-5">
        <div className="flex flex-col gap-4">{children}</div>
      </div>
      {footer ? (
        <div className="border-t border-border-1 bg-bg-2 px-5 py-4">{footer}</div>
      ) : null}
    </dialog>
  )
}
