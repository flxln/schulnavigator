'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type OrientationAuthState =
  | 'unsupported'
  | 'needs-gesture'
  | 'denied'
  | 'active'

function isIosOrientationPermissionModel(): boolean {
  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (
      DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
    ).requestPermission === 'function'
  )
}

export function useDeviceOrientation(enabled: boolean) {
  const [state, setState] = useState<OrientationAuthState>('unsupported')
  const [gamma, setGamma] = useState<number | null>(null)
  const raf = useRef<number | null>(null)
  const latestGamma = useRef<number | null>(null)

  const flush = useCallback(() => {
    raf.current = null
    if (latestGamma.current !== null) {
      setGamma(latestGamma.current)
    }
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }
    queueMicrotask(() => {
      if (!window.DeviceOrientationEvent) {
        setState('unsupported')
        return
      }
      if (isIosOrientationPermissionModel()) {
        setState('needs-gesture')
        return
      }
      setState('active')
    })
  }, [enabled])

  useEffect(() => {
    if (state !== 'active') {
      return
    }
    const onOrient = (e: DeviceOrientationEvent) => {
      if (typeof e.gamma !== 'number' || Number.isNaN(e.gamma)) {
        return
      }
      latestGamma.current = e.gamma
      if (raf.current === null) {
        raf.current = window.requestAnimationFrame(flush)
      }
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
      }
    }
  }, [state, flush])

  const requestAccess = useCallback(async () => {
    if (!window.DeviceOrientationEvent) {
      setState('unsupported')
      return
    }
    const req = (
      DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
    ).requestPermission
    if (typeof req === 'function') {
      try {
        const r = await req.call(DeviceOrientationEvent)
        if (r === 'granted') {
          setState('active')
        } else {
          setState('denied')
        }
      } catch {
        setState('denied')
      }
      return
    }
    setState('active')
  }, [])

  return { state, gamma, requestAccess }
}
