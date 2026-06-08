'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  angleDeltaDeg,
  headingFromOrientation,
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

export function useDeviceOrientation(enabled: boolean) {
  const [state, setState] = useState<OrientationAuthState>('unsupported')
  const [alpha, setAlpha] = useState<number | null>(null)
  const [beta, setBeta] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)
  const [panAngle, setPanAngle] = useState<number | null>(null)
  const [panAxis, setPanAxis] = useState<PanAxis>('alpha')
  const [axisEpoch, setAxisEpoch] = useState(0)

  const raf = useRef<number | null>(null)
  const latestAlpha = useRef<number | null>(null)
  const latestGamma = useRef<number | null>(null)
  const prevRawAlpha = useRef<number | null>(null)
  const unwrappedAlpha = useRef<number | null>(null)
  const lastGoodGamma = useRef<number | null>(null)
  const lastGoodBeta = useRef<number | null>(null)
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
      setBeta(null)
      setGamma(null)
      setPanAngle(null)
      prevRawAlpha.current = null
      unwrappedAlpha.current = null
      latestAlpha.current = null
      lastGoodGamma.current = null
      lastGoodBeta.current = null
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
    if (latestAlpha.current !== null) {
      setAlpha(latestAlpha.current)
    }
    if (lastGoodBeta.current !== null) {
      setBeta(lastGoodBeta.current)
    }
    if (latestGamma.current !== null) {
      setGamma(latestGamma.current)
    }
    const axis = panAxisRef.current
    if (axis === 'gamma' && latestGamma.current !== null) {
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
      const ea = e.alpha
      const eb = e.beta
      const eg = e.gamma
      // Portrait-Pan-Winkel: stabiler Yaw aus α/β/γ statt rohem α (ruhig durch β=90°).
      const a =
        typeof ea === 'number' &&
        !Number.isNaN(ea) &&
        typeof eb === 'number' &&
        !Number.isNaN(eb) &&
        typeof eg === 'number' &&
        !Number.isNaN(eg)
          ? headingFromOrientation(ea, eb, eg)
          : null
      if (a !== null) {
        const prevRaw = prevRawAlpha.current
        if (prevRaw === null) {
          prevRawAlpha.current = a
          unwrappedAlpha.current = a
          latestAlpha.current = a
        } else {
          const d = angleDeltaDeg(a, prevRaw)
          if (Math.abs(d) <= GLITCH_JUMP_DEG) {
            prevRawAlpha.current = a
            // Kontinuierlicher (entfalteter) Heading: kleine, eindeutige
            // Frame-Deltas aufsummieren — kein 0/360-Sprung mehr.
            const unwrapped = (unwrappedAlpha.current ?? a) + d
            unwrappedAlpha.current = unwrapped
            const prevSmoothed = latestAlpha.current ?? unwrapped
            latestAlpha.current =
              prevSmoothed + ORIENTATION_EMA_ALPHA * (unwrapped - prevSmoothed)
          }
        }
      }

      const b = e.beta
      if (typeof b === 'number' && !Number.isNaN(b)) {
        const prevB = lastGoodBeta.current
        if (prevB === null || Math.abs(b - prevB) <= GLITCH_JUMP_DEG) {
          const smoothed =
            prevB === null ? b : prevB + ORIENTATION_EMA_ALPHA * (b - prevB)
          lastGoodBeta.current = smoothed
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
    beta,
    gamma,
    panAngle,
    panAxis,
    axisEpoch,
    requestAccess,
  }
}
