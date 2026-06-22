'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { BrandSlotManifest } from '@/lib/mpz-brand-ingest'
import type { BrandSlotCategory } from '@/lib/mpz-brand-validation'

export type BrandPanelProps = {
  initialSlots: readonly BrandSlotManifest[]
}

const CATEGORY_META: Record<
  BrandSlotCategory,
  { title: string; description: string }
> = {
  logos: {
    title: 'Logos',
    description: 'SVG- und PNG-Logos für Eintritt und Jubiläums-Branding.',
  },
  mascots: {
    title: 'Maskottchen',
    description: 'Frieda und Otto — Dialog, Coach und Hotspot-Marker im Raumbild.',
  },
  motifs: {
    title: 'Motive (optional)',
    description:
      'Dekorative PNGs. Die App nutzt sie erst, wenn die Laufzeit-Komponenten umgestellt sind.',
  },
}

function acceptLabel(accept: BrandSlotManifest['accept']): string {
  return accept === 'svg' ? 'SVG' : 'PNG'
}

function formatBytes(bytes: number): string {
  const KB = 1024
  const MB = 1024 * KB
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`
  return `${Math.round(bytes / KB)} KB`
}

function BrandSlotCard({
  slot,
  onSlotUpdated,
}: {
  slot: BrandSlotManifest
  onSlotUpdated: (id: string, patch: Partial<BrandSlotManifest>) => void
}) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewMtime, setPreviewMtime] = useState(slot.mtime)

  const previewSrc =
    slot.exists && previewMtime
      ? `${slot.publicPath}?t=${encodeURIComponent(previewMtime)}`
      : null

  async function uploadFile(file: File) {
    setUploadError(null)
    setBusy(true)
    const form = new FormData()
    form.set('slot', slot.id)
    form.set('file', file)
    try {
      const res = await fetch('/api/mpz/brand/upload', { method: 'POST', body: form })
      const json = (await res.json()) as {
        path?: string
        mtime?: string
        message?: string
      }

      if (!res.ok) {
        setUploadError(json.message ?? `Upload fehlgeschlagen (${res.status})`)
        return
      }

      if (json.mtime) {
        setPreviewMtime(json.mtime)
        onSlotUpdated(slot.id, {
          exists: true,
          mtime: json.mtime,
          byteLength: file.size,
        })
      }
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

    if (slot.exists) {
      const ok = window.confirm(
        `„${slot.label}" existiert bereits. Datei ersetzen?`,
      )
      if (!ok) return
    }

    void uploadFile(file)
  }

  const acceptMime =
    slot.accept === 'svg'
      ? '.svg,image/svg+xml'
      : '.png,image/png'

  return (
    <li className="rounded-gs39-md border border-border-1 bg-bg-1 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-gs39-sm border border-border-1 bg-bg-2">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt=""
              className="max-h-16 max-w-16 object-contain"
            />
          ) : (
            <span className="text-xs text-fg-3">leer</span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-semibold text-fg-1">{slot.label}</p>
            <code className="font-mono text-xs text-fg-3">{slot.publicPath}</code>
          </div>
          <p className="text-xs text-fg-3">
            {acceptLabel(slot.accept)} · max. {formatBytes(slot.maxBytes)}
            {slot.exists && slot.byteLength !== null
              ? ` · aktuell ${formatBytes(slot.byteLength)}`
              : ' · noch nicht hochgeladen'}
          </p>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-sm font-semibold text-fg-1 hover:bg-bg-2">
            <span>{busy ? 'Lädt …' : slot.exists ? 'Ersetzen' : 'Hochladen'}</span>
            <input
              type="file"
              accept={acceptMime}
              className="sr-only"
              disabled={busy}
              onChange={handleFileChange}
            />
          </label>

          {uploadError && (
            <p role="alert" className="text-sm text-brand-red">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

export function BrandPanel({ initialSlots }: BrandPanelProps) {
  const [slots, setSlots] = useState<BrandSlotManifest[]>(() => [...initialSlots])

  const handleSlotUpdated = useCallback((id: string, patch: Partial<BrandSlotManifest>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const categories: BrandSlotCategory[] = ['logos', 'mascots', 'motifs']

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-fg-1">Brand & Design</h2>
        <p className="mt-1 text-sm text-fg-3">
          Logos, Maskottchen und optionale Motive unter{' '}
          <code className="text-fg-2">public/brand/</code>. Änderungen sind in der App
          sofort sichtbar — nach dem Speichern manuell committen und deployen.
        </p>
        <p className="mt-2 text-sm">
          Station-Akzente und Hub-Icons:{' '}
          <Link href="/mpz/studio/design?tab=hub" className="font-medium text-brand-blue underline">
            Hub-Karte
          </Link>
        </p>
      </div>

      {categories.map((category) => {
        const meta = CATEGORY_META[category]
        const categorySlots = slots.filter((s) => s.category === category)
        return (
          <section key={category} className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-fg-1">{meta.title}</h3>
              <p className="text-xs text-fg-3">{meta.description}</p>
            </div>
            <ul className="space-y-3">
              {categorySlots.map((slot) => (
                <BrandSlotCard
                  key={slot.id}
                  slot={slot}
                  onSlotUpdated={handleSlotUpdated}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
