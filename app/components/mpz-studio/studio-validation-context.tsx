'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { MpzValidationReport } from '@/lib/mpz-studio-overview'

export const MPZ_STUDIO_DIRTY_EVENT = 'mpz-studio-dirty'

export type SaveValidateFeedback = {
  ok: boolean
  rolledBack: boolean
  saved: boolean
}

type StudioValidationContextValue = {
  report: MpzValidationReport | null
  loading: boolean
  dirty: boolean
  error: string | null
  saveFeedback: SaveValidateFeedback | null
  applyReport: (report: MpzValidationReport, mtime: string | null) => void
  markDirty: () => void
  validateNow: () => Promise<void>
  saveAndValidate: () => Promise<void>
  clearSaveFeedback: () => void
}

const StudioValidationContext = createContext<StudioValidationContextValue | null>(
  null,
)

export function markMpzStudioDirty(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MPZ_STUDIO_DIRTY_EVENT))
  }
}

export function StudioValidationProvider({ children }: { children: ReactNode }) {
  const [report, setReport] = useState<MpzValidationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveFeedback, setSaveFeedback] = useState<SaveValidateFeedback | null>(
    null,
  )
  const lastValidatedMtimeRef = useRef<string | null>(null)

  const applyReport = useCallback(
    (nextReport: MpzValidationReport, mtime: string | null) => {
      setReport(nextReport)
      lastValidatedMtimeRef.current = mtime ?? nextReport.stationsModifiedAt
      setDirty(false)
      setError(null)
    },
    [],
  )

  const validateNow = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mpz/validate')
      if (res.status === 401) {
        setError('Zuerst /mpz/unlock aufrufen.')
        setReport(null)
        return
      }
      if (!res.ok) {
        setError('Validierung fehlgeschlagen.')
        return
      }
      const data = (await res.json()) as MpzValidationReport
      applyReport(data, data.stationsModifiedAt)
    } catch {
      setError('Netzwerkfehler bei der Validierung.')
    } finally {
      setLoading(false)
    }
  }, [applyReport])

  const markDirty = useCallback(() => {
    setDirty(true)
    setSaveFeedback(null)
  }, [])

  const saveAndValidate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSaveFeedback(null)
    try {
      const res = await fetch('/api/mpz/save-validate', { method: 'POST' })
      if (res.status === 401) {
        setError('Zuerst /mpz/unlock aufrufen.')
        return
      }
      if (!res.ok) {
        const json = (await res.json()) as { message?: string }
        setError(json.message ?? 'Speichern & Validieren fehlgeschlagen.')
        return
      }
      const body = (await res.json()) as {
        report: MpzValidationReport
        rolledBack: boolean
        saved: boolean
        postWriteMtime: string | null
      }
      applyReport(body.report, body.postWriteMtime)
      setSaveFeedback({
        ok: body.report.ok,
        rolledBack: body.rolledBack,
        saved: body.saved,
      })
      if (body.rolledBack) {
        setDirty(true)
      }
    } catch {
      setError('Netzwerkfehler bei Speichern & Validieren.')
    } finally {
      setLoading(false)
    }
  }, [applyReport])

  const clearSaveFeedback = useCallback(() => {
    setSaveFeedback(null)
  }, [])

  useEffect(() => {
    void validateNow()
  }, [validateNow])

  useEffect(() => {
    const onDirty = () => markDirty()
    window.addEventListener(MPZ_STUDIO_DIRTY_EVENT, onDirty)
    return () => window.removeEventListener(MPZ_STUDIO_DIRTY_EVENT, onDirty)
  }, [markDirty])

  return (
    <StudioValidationContext.Provider
      value={{
        report,
        loading,
        dirty,
        error,
        saveFeedback,
        applyReport,
        markDirty,
        validateNow,
        saveAndValidate,
        clearSaveFeedback,
      }}
    >
      {children}
    </StudioValidationContext.Provider>
  )
}

export function useStudioValidation(): StudioValidationContextValue {
  const ctx = useContext(StudioValidationContext)
  if (!ctx) {
    throw new Error('useStudioValidation nur innerhalb StudioValidationProvider')
  }
  return ctx
}
