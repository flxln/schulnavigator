'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type OrientationAuthState =
  | 'unsupported'
  | 'needs-gesture'
  | 'denied'
  | 'active'

const STORAGE_KEY = 'schulnav.gyro.granted'
const WATCHDOG_MS = 2000
const GAMMA_MAX_ABS = 90
const GAMMA_MAX_JUMP = 30

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
  const lastGoodGamma = useRef<number | null>(null)
  const pendingIosWatchdogRef = useRef(false)
  const watchdogTimerRef = useRef<number | null>(null)

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current !== null) {
      window.clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }
  }, [])

  const armIosCacheWatchdog = useCallback(() => {
    clearWatchdog()
    if (!pendingIosWatchdogRef.current) {
      return
    }
    watchdogTimerRef.current = window.setTimeout(() => {
      watchdogTimerRef.current = null
      pendingIosWatchdogRef.current = false
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      setState(
        isIosOrientationPermissionModel() ? 'needs-gesture' : 'unsupported',
      )
      setGamma(null)
      lastGoodGamma.current = null
    }, WATCHDOG_MS)
  }, [clearWatchdog])

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
        try {
          if (sessionStorage.getItem(STORAGE_KEY) === '1') {
            pendingIosWatchdogRef.current = true
            setState('active')
            return
          }
        } catch {
          /* ignore */
        }
        pendingIosWatchdogRef.current = false
        setState('needs-gesture')
        return
      }
      pendingIosWatchdogRef.current = false
      setState('active')
    })
  }, [enabled])

  useEffect(() => {
    if (state !== 'active') {
      clearWatchdog()
      return
    }

    armIosCacheWatchdog()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        armIosCacheWatchdog()
      }
    }

    const onOrient = (e: DeviceOrientationEvent) => {
      const g = e.gamma
      if (typeof g !== 'number' || Number.isNaN(g)) {
        return
      }
      if (Math.abs(g) > GAMMA_MAX_ABS) {
        return
      }
      const prev = lastGoodGamma.current
      if (prev !== null && Math.abs(g - prev) > GAMMA_MAX_JUMP) {
        return
      }
      lastGoodGamma.current = g
      latestGamma.current = g
      if (pendingIosWatchdogRef.current) {
        pendingIosWatchdogRef.current = false
        clearWatchdog()
      }
      if (raf.current === null) {
        raf.current = window.requestAnimationFrame(flush)
      }
    }

    window.addEventListener('deviceorientation', onOrient)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      document.removeEventListener('visibilitychange', onVisibility)
      clearWatchdog()
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
      }
    }
  }, [state, flush, armIosCacheWatchdog, clearWatchdog])

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
          try {
            sessionStorage.setItem(STORAGE_KEY, '1')
          } catch {
            /* ignore */
          }
          pendingIosWatchdogRef.current = false
          clearWatchdog()
          setState('active')
        } else {
          setState('denied')
        }
      } catch {
        setState('denied')
      }
      return
    }
    pendingIosWatchdogRef.current = false
    clearWatchdog()
    setState('active')
  }, [clearWatchdog])

  return { state, gamma, requestAccess }
}
