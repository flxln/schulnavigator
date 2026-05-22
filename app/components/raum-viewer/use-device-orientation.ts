'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  circularEmaDeg,
  resolvePanAxis,
  type PanAxis,
} from '@/lib/raum-viewer/pan-from-orientation'

export type OrientationAuthState =
  | 'unsupported'
  | 'needs-gesture'
  | 'denied'
  | 'active'

const STORAGE_KEY = 'schulnav.gyro.granted'
const WATCHDOG_MS = 2000
const GAMMA_MAX_ABS = 90
const ORIENTATION_EMA_ALPHA = 0.38
const GLITCH_JUMP_DEG = 50

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

function circularGlitchDelta(next: number, prev: number): number {
  let delta = next - prev
  while (delta > 180) {
    delta -= 360
  }
  while (delta < -180) {
    delta += 360
  }
  return Math.abs(delta)
}

export function useDeviceOrientation(enabled: boolean) {
  const [state, setState] = useState<OrientationAuthState>('unsupported')
  const [alpha, setAlpha] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)
  const [panAngle, setPanAngle] = useState<number | null>(null)
  const [panAxis, setPanAxis] = useState<PanAxis>('alpha')
  const [axisEpoch, setAxisEpoch] = useState(0)

  const raf = useRef<number | null>(null)
  const latestAlpha = useRef<number | null>(null)
  const latestGamma = useRef<number | null>(null)
  const lastGoodAlpha = useRef<number | null>(null)
  const lastGoodGamma = useRef<number | null>(null)
  const panAxisRef = useRef<PanAxis>('alpha')
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
      setAlpha(null)
      setGamma(null)
      setPanAngle(null)
      lastGoodAlpha.current = null
      lastGoodGamma.current = null
    }, WATCHDOG_MS)
  }, [clearWatchdog])

  const syncPanAxis = useCallback(() => {
    const next = resolvePanAxis()
    if (next !== panAxisRef.current) {
      panAxisRef.current = next
      setPanAxis(next)
      setAxisEpoch((e) => e + 1)
    }
  }, [])

  const flush = useCallback(() => {
    raf.current = null
    const axis = panAxisRef.current
    if (axis === 'alpha' && latestAlpha.current !== null) {
      setAlpha(latestAlpha.current)
      setPanAngle(latestAlpha.current)
    } else if (latestGamma.current !== null) {
      setGamma(latestGamma.current)
      setPanAngle(latestGamma.current)
    }
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }
    syncPanAxis()
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
  }, [enabled, syncPanAxis])

  useEffect(() => {
    if (state !== 'active') {
      clearWatchdog()
      return
    }

    armIosCacheWatchdog()
    syncPanAxis()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        armIosCacheWatchdog()
      }
    }

    const onOrientationChange = () => {
      syncPanAxis()
    }

    const onOrient = (e: DeviceOrientationEvent) => {
      const a = e.alpha
      if (typeof a === 'number' && !Number.isNaN(a)) {
        const prevA = lastGoodAlpha.current
        if (
          prevA === null ||
          circularGlitchDelta(a, prevA) <= GLITCH_JUMP_DEG
        ) {
          const smoothed = circularEmaDeg(prevA, a, ORIENTATION_EMA_ALPHA)
          lastGoodAlpha.current = smoothed
          latestAlpha.current = smoothed
        }
      }

      const g = e.gamma
      if (typeof g === 'number' && !Number.isNaN(g) && Math.abs(g) <= GAMMA_MAX_ABS) {
        const prevG = lastGoodGamma.current
        if (prevG === null || Math.abs(g - prevG) <= GLITCH_JUMP_DEG) {
          const smoothed =
            prevG === null ? g : prevG + ORIENTATION_EMA_ALPHA * (g - prevG)
          lastGoodGamma.current = smoothed
          latestGamma.current = smoothed
        }
      }

      if (pendingIosWatchdogRef.current) {
        const axis = panAxisRef.current
        const gotEvent =
          axis === 'alpha'
            ? latestAlpha.current !== null
            : latestGamma.current !== null
        if (gotEvent) {
          pendingIosWatchdogRef.current = false
          clearWatchdog()
        }
      }

      if (raf.current === null) {
        raf.current = window.requestAnimationFrame(flush)
      }
    }

    window.addEventListener('deviceorientation', onOrient)
    window.addEventListener('orientationchange', onOrientationChange)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('orientationchange', onOrientationChange)
      document.removeEventListener('visibilitychange', onVisibility)
      clearWatchdog()
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
      }
    }
  }, [state, flush, armIosCacheWatchdog, clearWatchdog, syncPanAxis])

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
          syncPanAxis()
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
    syncPanAxis()
    setState('active')
  }, [clearWatchdog, syncPanAxis])

  return {
    state,
    alpha,
    gamma,
    panAngle,
    panAxis,
    axisEpoch,
    requestAccess,
  }
}
