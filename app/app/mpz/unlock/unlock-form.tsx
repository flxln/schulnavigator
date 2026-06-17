'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { MPZ_STUDIO_HEADER } from '@/lib/mpz-studio-guard'

export default function MpzStudioUnlockForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/mpz/studio'
  const [secret, setSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch('/api/mpz/session', {
        method: 'POST',
        headers: { [MPZ_STUDIO_HEADER]: secret },
      })
      if (!res.ok) {
        setError(res.status === 404 ? 'Studio ist nicht aktiv.' : 'Ungültiges Secret.')
        return
      }
      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Verbindung fehlgeschlagen.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-fg-1">MPZ Studio entsperren</h1>
        <p className="text-sm text-fg-2">
          Nur lokal (<code className="text-fg-1">development</code>). Secret aus{' '}
          <code className="text-fg-1">app/.env.local</code> →{' '}
          <code className="text-fg-1">SN_MPZ_STUDIO_SECRET</code>.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm"
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-fg-1">
          Studio-Secret
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 font-mono text-sm"
            required
          />
        </label>

        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-gs39-sm bg-accent px-4 py-2 text-sm font-semibold text-fg-on-dark disabled:opacity-60"
        >
          {pending ? 'Wird geprüft …' : 'Entsperren'}
        </button>
      </form>
    </main>
  )
}
