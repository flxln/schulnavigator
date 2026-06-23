'use client'

import {
  mpzButtonClassName,
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import {
  markMpzStudioDirty,
  useStudioValidation,
} from '@/components/mpz-studio/studio-validation-context'
import {
  DEFAULT_BUBBLE_FOLLOW_PAN,
  DEFAULT_BUBBLE_FONT_SIZE,
  DEFAULT_BUBBLE_MAX_WIDTH,
  DEFAULT_BUBBLE_Y,
  MAX_BUBBLE_FONT_SIZE,
  MAX_BUBBLE_MAX_WIDTH,
  MAX_BUBBLE_X,
  MAX_BUBBLE_Y,
  MIN_BUBBLE_FONT_SIZE,
  MIN_BUBBLE_MAX_WIDTH,
  MIN_BUBBLE_X,
  MIN_BUBBLE_Y,
} from '@/lib/dialog-bubble-layout'
import type { DialogBubbleLayout } from '@/lib/types'

export type StationDialogBubbleFormProps = {
  slug: string
  bubble: DialogBubbleLayout | undefined
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

function bubbleToForm(bubble: DialogBubbleLayout | undefined) {
  return {
    y: String(bubble?.y ?? DEFAULT_BUBBLE_Y),
    x: String(bubble?.x ?? 0.5),
    maxWidth: String(bubble?.maxWidth ?? DEFAULT_BUBBLE_MAX_WIDTH),
    fontSize: String(bubble?.fontSize ?? DEFAULT_BUBBLE_FONT_SIZE),
    followPan: bubble?.followPan ?? DEFAULT_BUBBLE_FOLLOW_PAN,
  }
}

export function StationDialogBubbleForm({
  slug,
  bubble,
  onSuccess,
  onError,
}: StationDialogBubbleFormProps) {
  const router = useRouter()
  const { validateNow } = useStudioValidation()
  const [form, setForm] = useState(() => bubbleToForm(bubble))
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setForm(bubbleToForm(bubble))
  }, [bubble])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onError('')

    const body: DialogBubbleLayout = {
      y: Number(form.y),
      x: Number(form.x),
      maxWidth: Number(form.maxWidth),
      fontSize: Number(form.fontSize),
      followPan: form.followPan,
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/dialog`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ bubble: body }),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          onError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        onSuccess('Sprechblasen-Layout gespeichert.')
      } catch {
        onError('Speichern fehlgeschlagen.')
      }
    })
  }

  async function handleClear() {
    if (!window.confirm('Bubble-Layout aus stations.json entfernen?')) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/mpz/stations/${encodeURIComponent(slug)}/dialog`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ bubble: null }),
        })
        const json = (await res.json()) as { message?: string }
        if (!res.ok) {
          onError(json.message ?? `Fehler (${res.status})`)
          return
        }
        markMpzStudioDirty()
        await validateNow()
        router.refresh()
        onSuccess('Bubble-Layout entfernt.')
      } catch {
        onError('Entfernen fehlgeschlagen.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-fg-2">
        Viewport-relative Werte (ADR-015). Leer = Standard aus dem Viewer.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={mpzLabelClassName()} htmlFor="bubble-y">
            y ({MIN_BUBBLE_Y}–{MAX_BUBBLE_Y})
          </label>
          <input
            id="bubble-y"
            type="number"
            step="0.01"
            min={MIN_BUBBLE_Y}
            max={MAX_BUBBLE_Y}
            className={mpzFieldClassName()}
            value={form.y}
            onChange={(e) => setForm((p) => ({ ...p, y: e.target.value }))}
          />
        </div>
        <div>
          <label className={mpzLabelClassName()} htmlFor="bubble-x">
            x ({MIN_BUBBLE_X}–{MAX_BUBBLE_X})
          </label>
          <input
            id="bubble-x"
            type="number"
            step="0.01"
            min={MIN_BUBBLE_X}
            max={MAX_BUBBLE_X}
            className={mpzFieldClassName()}
            value={form.x}
            onChange={(e) => setForm((p) => ({ ...p, x: e.target.value }))}
          />
        </div>
        <div>
          <label className={mpzLabelClassName()} htmlFor="bubble-maxWidth">
            maxWidth ({MIN_BUBBLE_MAX_WIDTH}–{MAX_BUBBLE_MAX_WIDTH})
          </label>
          <input
            id="bubble-maxWidth"
            type="number"
            step="0.01"
            min={MIN_BUBBLE_MAX_WIDTH}
            max={MAX_BUBBLE_MAX_WIDTH}
            className={mpzFieldClassName()}
            value={form.maxWidth}
            onChange={(e) => setForm((p) => ({ ...p, maxWidth: e.target.value }))}
          />
        </div>
        <div>
          <label className={mpzLabelClassName()} htmlFor="bubble-fontSize">
            fontSize ({MIN_BUBBLE_FONT_SIZE}–{MAX_BUBBLE_FONT_SIZE})
          </label>
          <input
            id="bubble-fontSize"
            type="number"
            step="0.0001"
            min={MIN_BUBBLE_FONT_SIZE}
            max={MAX_BUBBLE_FONT_SIZE}
            className={mpzFieldClassName()}
            value={form.fontSize}
            onChange={(e) => setForm((p) => ({ ...p, fontSize: e.target.value }))}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-fg-1">
        <input
          type="checkbox"
          checked={form.followPan}
          onChange={(e) => setForm((p) => ({ ...p, followPan: e.target.checked }))}
        />
        followPan
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={mpzButtonClassName('primary')}
        >
          Bubble speichern
        </button>
        {bubble && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => void handleClear()}
            className={mpzButtonClassName('secondary')}
          >
            Layout entfernen
          </button>
        )}
      </div>
    </form>
  )
}
