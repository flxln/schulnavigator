'use client'

import { useCallback, useEffect, useState } from 'react'

export type HotspotIconUploadProps = {
  slug: string
  onUploaded?: (path: string) => void
}

async function fetchIconPaths(slug: string): Promise<string[]> {
  const res = await fetch(
    `/api/mpz/stations/${encodeURIComponent(slug)}/hotspot-icons`,
  )
  const json = (await res.json()) as { paths?: string[]; message?: string }
  if (!res.ok) {
    throw new Error(json.message ?? `Fehler (${res.status})`)
  }
  return json.paths ?? []
}

export function HotspotIconUpload({ slug, onUploaded }: HotspotIconUploadProps) {
  const [paths, setPaths] = useState<string[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    setLoadError(null)
    try {
      const next = await fetchIconPaths(slug)
      setPaths(next)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Liste konnte nicht geladen werden.')
      setPaths([])
    }
  }, [slug])

  useEffect(() => {
    void reload()
  }, [reload])

  async function uploadFile(file: File, collision: 'reject' | 'replace') {
    setUploadError(null)
    setBusy(true)
    const form = new FormData()
    form.set('slug', slug)
    form.set('file', file)
    form.set('collision', collision)
    try {
      const res = await fetch('/api/mpz/hotspots/icon', { method: 'POST', body: form })
      const json = (await res.json()) as { path?: string; message?: string; error?: string }

      if (res.status === 409 && collision === 'reject') {
        const ok = window.confirm(
          `Icon „${file.name}" existiert bereits. Überschreiben?`,
        )
        if (ok) {
          await uploadFile(file, 'replace')
        }
        return
      }

      if (!res.ok) {
        setUploadError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }

      if (json.path) {
        onUploaded?.(json.path)
      }
      await reload()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || busy) return
    void uploadFile(file, 'reject')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 font-semibold text-fg-1 hover:bg-bg-2">
          <span>{busy ? 'Lädt …' : 'Icon hochladen'}</span>
          <input
            type="file"
            accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={handleFileChange}
          />
        </label>
        <span className="text-xs text-fg-3">SVG, PNG oder WebP · max. 2 MB</span>
      </div>

      {loadError && (
        <p role="alert" className="text-sm text-brand-red">
          {loadError}
        </p>
      )}

      {uploadError && (
        <p role="alert" className="text-sm text-brand-red">
          {uploadError}
        </p>
      )}

      {paths.length > 0 && (
        <ul className="flex flex-col gap-2 rounded-gs39-md border border-border-1 bg-bg-1 p-3">
          {paths.map((path) => (
            <li key={path} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={path}
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
              />
              <code className="font-mono text-xs text-fg-2">{path}</code>
            </li>
          ))}
        </ul>
      )}

      {!loadError && paths.length === 0 && (
        <p className="text-xs text-fg-3">Noch keine Icons in diesem Ordner.</p>
      )}
    </div>
  )
}
