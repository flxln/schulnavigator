'use client'

import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { MpzFormAlert } from '@/components/mpz-studio/mpz-form-alert'
import { mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'
import { DEFAULT_DEPLOY_BRANCH } from '@/lib/mpz-deploy-constants'

type DeployEnv = {
  baseUrl: string | null
  embedEnabled: boolean
}

type PreviewLinks = {
  hubUrl: string
  entryFestUrl: string
  entryHeftUrl: string
  rooms: Array<{ slug: string; url: string }>
}

type ValidateStep = {
  name: string
  exitCode: number
  stdout: string
  stderr: string
}

type SyncFeedback = {
  variant: 'success' | 'error'
  message: string
}

const COOLIFY_CHECKLIST = [
  'SN_ACCESS_TOKENS in Coolify Prod + Dev setzen (vor Deploy)',
  'git add lib/access-token-constants.mjs public/qr/manifest.json public/qr/manifest-schulfest.json',
  'Commit, Push, Deploy',
  'Entry-QRs aus public/qr/pdf/ drucken (alte Tokens verbrannt)',
]

function isSyncDeployLabel(label: string): boolean {
  return label === 'sync-media-only' || label === 'sync-full'
}

function syncSuccessMessage(label: string): string {
  return label === 'sync-full'
    ? 'Vollständiger Deploy abgeschlossen.'
    : 'Medien erfolgreich synchronisiert.'
}

export function DeployTab() {
  const [env, setEnv] = useState<DeployEnv | null>(null)
  const [baseUrlInput, setBaseUrlInput] = useState('')
  const [embedEnabled, setEmbedEnabled] = useState(false)
  const [envMessage, setEnvMessage] = useState<string | null>(null)
  const [envError, setEnvError] = useState<string | null>(null)
  const [envSaving, setEnvSaving] = useState(false)

  const [preview, setPreview] = useState<PreviewLinks | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [actionLog, setActionLog] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const [syncFeedback, setSyncFeedback] = useState<SyncFeedback | null>(null)
  const [syncLog, setSyncLog] = useState<string | null>(null)

  const [validateSteps, setValidateSteps] = useState<ValidateStep[] | null>(null)
  const [validateOk, setValidateOk] = useState<boolean | null>(null)

  const loadEnv = useCallback(async () => {
    const res = await fetch('/api/mpz/deploy/env')
    if (!res.ok) {
      const json = (await res.json()) as { message?: string }
      setEnvError(json.message ?? 'Env konnte nicht geladen werden.')
      return
    }
    const data = (await res.json()) as DeployEnv
    setEnv(data)
    setBaseUrlInput(data.baseUrl ?? '')
    setEmbedEnabled(data.embedEnabled)
    setEnvError(null)
  }, [])

  const loadPreview = useCallback(async () => {
    const res = await fetch('/api/mpz/deploy/preview-links')
    if (!res.ok) {
      const json = (await res.json()) as { message?: string }
      setPreview(null)
      setPreviewError(json.message ?? 'Vorschau-Links nicht verfügbar.')
      return
    }
    setPreview((await res.json()) as PreviewLinks)
    setPreviewError(null)
  }, [])

  useEffect(() => {
    void loadEnv()
    void loadPreview()
  }, [loadEnv, loadPreview])

  async function saveEnv() {
    setEnvSaving(true)
    setEnvError(null)
    setEnvMessage(null)
    try {
      const res = await fetch('/api/mpz/deploy/env', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          baseUrl: baseUrlInput,
          embedEnabled,
        }),
      })
      const json = (await res.json()) as DeployEnv & {
        message?: string
        restartRequired?: boolean
      }
      if (!res.ok) {
        setEnvError(json.message ?? 'Speichern fehlgeschlagen.')
        return
      }
      setEnv({ baseUrl: json.baseUrl, embedEnabled: json.embedEnabled })
      setEnvMessage(
        json.restartRequired
          ? 'Gespeichert. Dev-Server neu starten, damit NEXT_PUBLIC_* wirksam wird.'
          : 'Gespeichert.',
      )
      await loadPreview()
    } finally {
      setEnvSaving(false)
    }
  }

  async function runDeployAction(
    label: string,
    url: string,
    body: object,
    confirmMessage?: string,
  ) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return
    }
    setBusyAction(label)
    setActionError(null)
    setActionLog(null)
    if (isSyncDeployLabel(label)) {
      setSyncFeedback(null)
      setSyncLog(null)
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as {
        ok?: boolean
        exitCode?: number
        stdout?: string
        stderr?: string
        coolifyJson?: string | null
        manifest?: unknown
        message?: string
        error?: string
      }

      if (res.status === 422 || res.status === 400) {
        const message = json.message ?? json.error ?? 'Anfrage abgelehnt.'
        if (isSyncDeployLabel(label)) {
          setSyncFeedback({ variant: 'error', message })
        }
        setActionError(message)
        return
      }
      if (res.status === 500) {
        const message = json.message ?? 'Interner Fehler.'
        if (isSyncDeployLabel(label)) {
          setSyncFeedback({ variant: 'error', message })
        }
        setActionError(message)
        return
      }

      const parts: string[] = []
      if (json.coolifyJson) {
        parts.push(`Coolify SN_ACCESS_TOKENS:\n${json.coolifyJson}`)
      }
      if (json.manifest) {
        parts.push(`QR-Manifest (Dry-Run):\n${JSON.stringify(json.manifest, null, 2)}`)
      }
      if (json.stdout) {
        parts.push(json.stdout)
      }
      if (json.stderr) {
        parts.push(`stderr:\n${json.stderr}`)
      }
      parts.push(`exitCode: ${json.exitCode ?? '—'}, ok: ${String(json.ok)}`)
      const logText = parts.join('\n\n')
      setActionLog(logText)

      if (isSyncDeployLabel(label)) {
        setSyncLog(logText)
        if (json.ok === true) {
          setSyncFeedback({ variant: 'success', message: syncSuccessMessage(label) })
        } else {
          setSyncFeedback({
            variant: 'error',
            message: 'Deploy-Skript mit Fehler beendet — Details unten.',
          })
        }
      }

      if (json.ok === false && !isSyncDeployLabel(label)) {
        setActionError('Skript mit Fehler beendet — Ausgabe prüfen.')
      }
      if (
        label.includes('Token') &&
        'dryRun' in body &&
        !(body as { dryRun: boolean }).dryRun
      ) {
        await loadPreview()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
      if (isSyncDeployLabel(label)) {
        setSyncFeedback({ variant: 'error', message })
      }
      setActionError(message)
    } finally {
      setBusyAction(null)
    }
  }

  async function runValidateAll() {
    setBusyAction('validate-all')
    setValidateSteps(null)
    setValidateOk(null)
    setActionError(null)
    try {
      const res = await fetch('/api/mpz/deploy/validate-all', { method: 'POST' })
      if (!res.ok) {
        const json = (await res.json()) as { message?: string }
        setActionError(json.message ?? 'Validate-all fehlgeschlagen.')
        return
      }
      const json = (await res.json()) as { ok: boolean; steps: ValidateStep[] }
      setValidateOk(json.ok)
      setValidateSteps(json.steps)
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-fg-2">
        Betrieb und Deploy-Vorbereitung — schreibt lokal ins Repo und{' '}
        <code className="text-fg-1">.env.local</code>. Kein automatischer Commit; Medien-Sync
        und optional Push über die Deploy-Buttons unten. Vollständig deployen setzt Branch{' '}
        <code className="text-fg-1">{DEFAULT_DEPLOY_BRANCH}</code> voraus (konfigurierbar via{' '}
        <code className="text-fg-1">DEPLOY_BRANCH</code>).
      </p>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Umgebung (.env.local)
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-fg-1">NEXT_PUBLIC_BASE_URL</span>
            <input
              type="url"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="https://39-gs.mpz.schule"
              className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1"
            />
            <span className="text-xs text-fg-3">HTTPS, ohne trailing slash — für QR-Druck die Live-Domain.</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-1">
            <input
              type="checkbox"
              checked={embedEnabled}
              onChange={(e) => setEmbedEnabled(e.target.checked)}
              className="size-4 rounded border-border-1"
            />
            NEXT_PUBLIC_EMBED_ENABLED (Delightex-iframe)
          </label>
          <button
            type="button"
            disabled={envSaving}
            onClick={() => void saveEnv()}
            className={`${mpzButtonClassName('primary')} self-start !min-h-0 px-3 py-1.5 disabled:opacity-50`}
          >
            {envSaving ? 'Speichern…' : 'Env speichern'}
          </button>
          {env && (
            <p className="text-xs text-fg-3">
              Aktuell geladen: {env.baseUrl ?? '—'} · Embed{' '}
              {env.embedEnabled ? 'an' : 'aus'}
            </p>
          )}
          {envMessage && (
            <MpzFormAlert variant="success">{envMessage}</MpzFormAlert>
          )}
          {envError && <MpzFormAlert variant="error">{envError}</MpzFormAlert>}
        </div>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">QR-Codes</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton
            label="Dry-Run (volles Set)"
            busy={busyAction === 'qr-dry-all'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction('qr-dry-all', '/api/mpz/deploy/generate-qr', {
                dryRun: true,
                preset: 'all',
              })
            }
          />
          <ActionButton
            label="QR generieren (volles Set)"
            busy={busyAction === 'qr-live-all'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction(
                'qr-live-all',
                '/api/mpz/deploy/generate-qr',
                { dryRun: false, preset: 'all' },
                'QR-PNGs und PDFs unter public/qr/ neu erzeugen?',
              )
            }
          />
          <ActionButton
            label="Schulfest-Set generieren"
            busy={busyAction === 'qr-schulfest'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction(
                'qr-schulfest',
                '/api/mpz/deploy/generate-qr',
                { dryRun: false, preset: 'schulfest' },
                'Schulfest-QR-Set (12 Räume + Entry fest) erzeugen?',
              )
            }
          />
        </div>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Entry-Token rotieren
        </h2>
        <p className="mt-2 text-sm text-fg-2">
          Live-Rotation überschreibt Tokens und regeneriert QR-Sets. Coolify-JSON zuerst per
          Dry-Run prüfen.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton
            label="Dry-Run"
            busy={busyAction === 'token-dry'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction('token-dry', '/api/mpz/deploy/rotate-tokens', {
                dryRun: true,
              })
            }
          />
          <ActionButton
            label="Live rotieren"
            busy={busyAction === 'token-live'}
            disabled={!!busyAction}
            variant="danger"
            onClick={() =>
              void runDeployAction(
                'token-live',
                '/api/mpz/deploy/rotate-tokens',
                { dryRun: false },
                'Tokens wirklich rotieren? Alte Entry-QRs werden ungültig. Danach Coolify ENV setzen.',
              )
            }
          />
        </div>
        <ul className="mt-4 list-inside list-decimal text-xs text-fg-3">
          {COOLIFY_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Schüler-Medien (Bahn B)
        </h2>
        <p className="mt-2 text-sm text-fg-2">
          Fotos, Videos, Dialog- und Coach-Audio liegen nicht auf GitHub. Nach Studio-Upload werden
          sie per rsync auf die Hetzner-Volumes synchronisiert (
          <code className="text-fg-1">DEPLOY_SSH</code> in{' '}
          <code className="text-fg-1">.env.local</code>). Vor dem Sync laufen{' '}
          <code className="text-fg-1">validate:stations</code> und{' '}
          <code className="text-fg-1">validate:coach</code> im Skript.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton
            label="Medien deployen"
            busy={busyAction === 'sync-media-only'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction(
                'sync-media-only',
                '/api/mpz/deploy/sync-content',
                { mode: 'media-only' },
                'Schüler-Medien auf den Server rsyncen (ohne git push)?',
              )
            }
          />
          <ActionButton
            label="Vollständig deployen"
            busy={busyAction === 'sync-full'}
            disabled={!!busyAction}
            onClick={() =>
              void runDeployAction(
                'sync-full',
                '/api/mpz/deploy/sync-content',
                { mode: 'full' },
                `Validate, git push, rsync und optional Coolify-Webhook — nur von Branch ${DEFAULT_DEPLOY_BRANCH}. Fortfahren?`,
              )
            }
          />
        </div>
        {syncFeedback && (
          <div className="mt-3 flex flex-col gap-2">
            <MpzFormAlert variant={syncFeedback.variant}>{syncFeedback.message}</MpzFormAlert>
            {syncLog && syncFeedback.variant === 'error' && (
              <details className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-xs text-fg-2">
                <summary className="cursor-pointer font-semibold text-fg-1">
                  Skript-Ausgabe
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">{syncLog}</pre>
              </details>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-fg-3">
          CLI: <code className="text-fg-2">npm run deploy:content</code> (Voll-Flow) oder{' '}
          <code className="text-fg-2">npm run deploy:content -- --media-only</code>. SSH-User braucht
          NOPASSWD für <code className="text-fg-2">sudo rsync</code>.
        </p>
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Validate-all
        </h2>
        <p className="mt-2 text-sm text-fg-2">
          validate:stations · validate:coach · validate:tokens · test — alle Schritte werden
          ausgeführt.
        </p>
        <ActionButton
          label="Validate-all starten"
          busy={busyAction === 'validate-all'}
          disabled={!!busyAction}
          onClick={() => void runValidateAll()}
        />
        {validateOk !== null && (
          <div className="mt-3">
            <MpzFormAlert variant={validateOk ? 'success' : 'error'}>
              {validateOk ? 'Alle Schritte grün.' : 'Mindestens ein Schritt fehlgeschlagen.'}
            </MpzFormAlert>
          </div>
        )}
        {validateSteps && (
          <ul className="mt-3 flex flex-col gap-2">
            {validateSteps.map((step) => (
              <li
                key={step.name}
                className="rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-xs"
              >
                <span
                  className={
                    step.exitCode === 0 ? 'font-semibold text-accent' : 'font-semibold text-error'
                  }
                >
                  {step.name} — exit {step.exitCode}
                </span>
                {step.stderr && (
                  <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap text-fg-3">
                    {step.stderr}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">
          Vorschau-Links
        </h2>
        {previewError && (
          <p className="mt-2 text-sm text-fg-3">{previewError}</p>
        )}
        {preview && (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <PreviewLink label="Hub" href={preview.hubUrl} />
            <PreviewLink label="Eintritt Fest" href={preview.entryFestUrl} />
            <PreviewLink label="Eintritt Heft" href={preview.entryHeftUrl} />
            {preview.rooms.map((room) => (
              <PreviewLink key={room.slug} label={room.slug} href={room.url} />
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => void loadPreview()}
          className="mt-3 text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          Links aktualisieren
        </button>
      </section>

      {(actionLog || actionError) && (
        <section className="rounded-gs39-md border border-border-1 bg-bg-2 p-5 shadow-gs39-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-3">Ausgabe</h2>
          {actionError && (
            <p className="mt-2 text-sm text-error">{actionError}</p>
          )}
          {actionLog && (
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-gs39-sm bg-bg-1 p-3 text-xs text-fg-2">
              {actionLog}
            </pre>
          )}
        </section>
      )}
    </div>
  )
}

function ActionButton({
  label,
  busy,
  disabled,
  onClick,
  variant = 'default',
}: {
  label: string
  busy: boolean
  disabled: boolean
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  const buttonVariant = variant === 'danger' ? 'danger' : 'primary'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${mpzButtonClassName(buttonVariant)} !min-h-0 px-3 py-1.5 disabled:opacity-50`}
    >
      {busy ? (
        <>
          <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
          Läuft…
        </>
      ) : (
        label
      )}
    </button>
  )
}

function PreviewLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-accent underline-offset-2 hover:underline"
      >
        {label}
      </a>
      <span className="ml-2 text-xs text-fg-3 break-all">{href}</span>
    </li>
  )
}
