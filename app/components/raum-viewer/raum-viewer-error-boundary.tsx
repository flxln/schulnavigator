'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import Link from 'next/link'
import { ROOM_VIEWER_HEIGHT_CSS } from '@/lib/raum-viewer/constants'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class RaumViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RaumViewer:', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-[var(--r-md)] border border-border-2 bg-brand-sky-50 px-4 py-8 text-center"
          style={{ minHeight: ROOM_VIEWER_HEIGHT_CSS }}
          role="alert"
        >
          <p className="text-sm font-medium text-fg-1">
            Die Raumansicht konnte nicht geladen werden.
          </p>
          <Link
            href="/"
            className="text-sm text-accent-alt underline underline-offset-2 hover:text-fg-1"
          >
            Zur Startseite
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
