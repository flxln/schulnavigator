'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type TextViewerProps = {
  src: string
}

function getExtension(src: string): string {
  const path = src.split('?')[0] ?? src
  const dot = path.lastIndexOf('.')
  return dot !== -1 ? path.slice(dot + 1).toLowerCase() : ''
}

function isSameOrigin(src: string): boolean {
  if (src.startsWith('/')) {
    return true
  }
  try {
    return new URL(src).origin === window.location.origin
  } catch {
    return false
  }
}

export function TextViewer({ src }: TextViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const ext = getExtension(src)
  const isMarkdown = ext === 'md'
  const isPlaintext = ext === 'txt'

  useEffect(() => {
    if (!isSameOrigin(src) || (!isMarkdown && !isPlaintext)) {
      setError(true)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const res = await fetch(src)
        if (!res.ok || res.redirected) {
          if (!cancelled) {
            setError(true)
            setLoading(false)
          }
          return
        }
        const ct = res.headers.get('content-type') ?? ''
        if (!ct.startsWith('text/') || ct.includes('text/html')) {
          if (!cancelled) {
            setError(true)
            setLoading(false)
          }
          return
        }
        const text = await res.text()
        if (!cancelled) {
          setContent(text)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [src, isMarkdown, isPlaintext])

  if (loading) {
    return (
      <div className="sn-media-text__loading" aria-busy="true">
        <span className="text-sm text-fg-3">Wird geladen …</span>
      </div>
    )
  }

  if (error || content === null) {
    return (
      <div className="sn-media-text__error">
        <p className="text-sm text-error">Text konnte nicht geladen werden.</p>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent-alt underline-offset-2 hover:underline"
        >
          Datei direkt öffnen
        </a>
      </div>
    )
  }

  if (isMarkdown) {
    return (
      <div className="sn-media-text sn-media-text--markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="sn-media-text sn-media-text--plain">
      <pre>{content}</pre>
    </div>
  )
}
