'use client'

import { useEffect } from 'react'

export function DisableZoom() {
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    const onGestureStart = (e: Event) => {
      e.preventDefault()
    }

    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('gesturestart', onGestureStart, { passive: false })

    return () => {
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('gesturestart', onGestureStart)
    }
  }, [])

  return null
}
