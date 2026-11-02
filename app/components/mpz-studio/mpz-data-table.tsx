'use client'

import type { ReactNode } from 'react'

export type MpzDataTableProps = {
  children: ReactNode
  minWidth?: string
  className?: string
  emptyText?: string
  isEmpty?: boolean
}

export function MpzDataTable({
  children,
  minWidth,
  className = '',
  emptyText,
  isEmpty = false,
}: MpzDataTableProps) {
  if (isEmpty && emptyText) {
    return (
      <p className="rounded-gs39-sm border border-border-1 bg-bg-2 px-3 py-4 text-sm text-fg-3">
        {emptyText}
      </p>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`w-full border-collapse text-sm ${minWidth ?? ''}`}
      >
        {children}
      </table>
    </div>
  )
}

export type MpzDataTableHeadProps = {
  children: ReactNode
}

export function MpzDataTableHead({ children }: MpzDataTableHeadProps) {
  return (
    <thead>
      <tr className="border-b border-border-1 bg-bg-2 text-left text-xs font-semibold uppercase text-fg-3">
        {children}
      </tr>
    </thead>
  )
}

export type MpzDataTableBodyProps = {
  children: ReactNode
}

export function MpzDataTableBody({ children }: MpzDataTableBodyProps) {
  return <tbody>{children}</tbody>
}
