'use client'

import { useEffect, useState } from 'react'

export type PhotoViewerProps = {
  src: string
  alt?: string
}

export function PhotoViewer({ src, alt }: PhotoViewerProps) {
  const [enlarged, setEnlarged] = useState(false)

  const close = () => setEnlarged(false)

  useEffect(() => {
    if (!enlarged) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', onKey, { capture: true })
    return () => document.removeEventListener('keydown', onKey, { capture: true })
  }, [enlarged])

  const label = alt ?? 'Stationsfoto'

  if (enlarged) {
    return (
      <div
        className="sn-media-photo sn-media-photo--enlarged"
        role="presentation"
        aria-label={`${label} – vergrößert`}
      >
        <button
          type="button"
          className="sn-media-photo__close-btn"
          onClick={close}
          aria-label="Vollbild schließen"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamische Stations-URL aus JSON; next/image bräuchte remotePatterns */}
        <img
          src={src}
          alt={label}
          className="sn-media-photo__img"
          onClick={close}
        />
      </div>
    )
  }

  return (
    <div className="sn-media-photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- dynamische Stations-URL aus JSON; next/image bräuchte remotePatterns */}
      <img
        src={src}
        alt={label}
        className="sn-media-photo__img"
        onClick={() => setEnlarged(true)}
      />
      <button
        type="button"
        className="sn-media-photo__expand-btn"
        onClick={() => setEnlarged(true)}
        aria-label="Bild vergrößern"
      >
        🔍 Vergrößern
      </button>
    </div>
  )
}
