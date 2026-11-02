'use client'

import { useCallback, useState } from 'react'

export const MAX_DIALOG_WAV_BYTES = 15 * 1024 * 1024

export function dialogPlayUrl(slug: string, expectedClip: string): string {
  return `/api/dialog/${slug}/${expectedClip}`
}

export function validateDialogWavFileSize(file: File): string | null {
  if (file.size > MAX_DIALOG_WAV_BYTES) {
    return `Dialog-WAV zu groß (max. ${Math.round(MAX_DIALOG_WAV_BYTES / (1024 * 1024))} MB).`
  }
  return null
}

export type UploadDialogClipOptions = {
  overrideQuelleDrift?: boolean
}

export type UploadDialogClipResult =
  | { ok: true }
  | { ok: false; message: string }

export async function uploadDialogClip(
  slug: string,
  segmentIndex: number,
  file: File,
  options?: UploadDialogClipOptions,
): Promise<UploadDialogClipResult> {
  const sizeError = validateDialogWavFileSize(file)
  if (sizeError) {
    return { ok: false, message: sizeError }
  }

  const form = new FormData()
  form.set('slug', slug)
  form.set('segmentIndex', String(segmentIndex))
  form.set('file', file)
  form.set('collision', 'replace')
  if (options?.overrideQuelleDrift) {
    form.set('overrideQuelleDrift', 'true')
  }

  try {
    const res = await fetch('/api/mpz/dialog-audio/ingest', {
      method: 'POST',
      body: form,
    })
    const json = (await res.json()) as { message?: string }
    if (!res.ok) {
      return {
        ok: false,
        message: json.message ?? `Upload fehlgeschlagen (${res.status})`,
      }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Upload fehlgeschlagen.' }
  }
}

export function useDialogSegmentAudioUpload() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (
      slug: string,
      segmentIndex: number,
      file: File,
      options?: UploadDialogClipOptions,
    ): Promise<boolean> => {
      setError(null)
      setBusy(true)
      try {
        const result = await uploadDialogClip(slug, segmentIndex, file, options)
        if (!result.ok) {
          setError(result.message)
          return false
        }
        return true
      } finally {
        setBusy(false)
      }
    },
    [],
  )

  return { busy, error, setError, upload }
}
