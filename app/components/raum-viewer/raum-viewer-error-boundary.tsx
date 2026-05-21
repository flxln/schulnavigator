'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import Link from 'next/link'

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
          className="flex min-h-[min(42vh,280px)] flex-col items-center justify-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-8 text-center"
          role="alert"
        >
          <p className="text-sm font-medium text-zinc-900">
            Die Raumansicht konnte nicht geladen werden.
          </p>
          <Link
            href="/"
            className="text-sm text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
          >
            Zur Startseite
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
