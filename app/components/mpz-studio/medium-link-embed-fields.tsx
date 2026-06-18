'use client'

import {
  DEFAULT_EMBED_ALLOW_SUFFIXES,
  isEmbedEnabled,
  isEmbedUrlAllowed,
  resolveEmbedAllowlist,
} from '@/lib/embed-allowlist'
import { isValidHttpsUrl } from '@/lib/external-link'

export type LinkEmbedFormValues = {
  untertitel: string
  thumbnail: string
  quelle: string
  openInExternal: boolean
  embedAllow: string[]
}

export type MediumLinkEmbedFieldsProps = {
  typ: 'link' | 'embed'
  slug: string
  values: LinkEmbedFormValues
  onChange: <K extends keyof LinkEmbedFormValues>(
    key: K,
    value: LinkEmbedFormValues[K],
  ) => void
  idPrefix: string
}

function fieldClassName(): string {
  return 'w-full rounded-gs39-sm border border-border-1 bg-bg-1 px-3 py-2 text-fg-1'
}

function labelClassName(): string {
  return 'mb-1 block text-xs font-semibold text-fg-3'
}

export function defaultLinkEmbedFormValues(typ: 'link' | 'embed'): LinkEmbedFormValues {
  return {
    untertitel: '',
    thumbnail: '',
    quelle: '',
    openInExternal: false,
    embedAllow: typ === 'embed' ? [...DEFAULT_EMBED_ALLOW_SUFFIXES] : [],
  }
}

export function MediumLinkEmbedFields({
  typ,
  slug,
  values,
  onChange,
  idPrefix,
}: MediumLinkEmbedFieldsProps) {
  const quelleTrimmed = values.quelle.trim()
  const httpsOk = quelleTrimmed === '' || isValidHttpsUrl(quelleTrimmed)
  const embedAllowlist =
    typ === 'embed'
      ? resolveEmbedAllowlist({
          embedAllow:
            values.embedAllow.length > 0 ? values.embedAllow : undefined,
        })
      : []
  const embedUrlOk =
    typ !== 'embed' ||
    quelleTrimmed === '' ||
    isEmbedUrlAllowed(quelleTrimmed, embedAllowlist)

  function toggleEmbedAllow(suffix: string) {
    const has = values.embedAllow.includes(suffix)
    onChange(
      'embedAllow',
      has
        ? values.embedAllow.filter((s) => s !== suffix)
        : [...values.embedAllow, suffix],
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-quelle`} className={labelClassName()}>
          Quelle (https)
        </label>
        <input
          id={`${idPrefix}-quelle`}
          type="url"
          required
          value={values.quelle}
          onChange={(e) => onChange('quelle', e.target.value)}
          className={`${fieldClassName()} font-mono text-xs`}
        />
        {quelleTrimmed && !httpsOk && (
          <p role="alert" className="mt-1 text-xs text-brand-red">
            Muss eine gültige https-URL sein.
          </p>
        )}
        {typ === 'embed' && quelleTrimmed && httpsOk && !embedUrlOk && (
          <p role="alert" className="mt-1 text-xs text-brand-red">
            URL liegt nicht auf einer erlaubten Embed-Domain.
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-untertitel`} className={labelClassName()}>
          Untertitel (optional)
        </label>
        <input
          id={`${idPrefix}-untertitel`}
          type="text"
          value={values.untertitel}
          onChange={(e) => onChange('untertitel', e.target.value)}
          className={fieldClassName()}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-thumbnail`} className={labelClassName()}>
          thumbnail (optional)
        </label>
        <input
          id={`${idPrefix}-thumbnail`}
          type="text"
          value={values.thumbnail}
          onChange={(e) => onChange('thumbnail', e.target.value)}
          placeholder="/media/…"
          className={`${fieldClassName()} font-mono text-xs`}
        />
        <p className="mt-1 text-xs text-fg-3">
          Pfad unter <code className="font-mono">/media/{slug}/</code> oder anderem öffentlichen
          Pfad.
        </p>
      </div>

      {typ === 'link' && (
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-fg-2">
            <input
              type="checkbox"
              checked={values.openInExternal}
              onChange={(e) => onChange('openInExternal', e.target.checked)}
            />
            In externem Tab öffnen (<code className="font-mono text-xs">openIn: external</code>)
          </label>
        </div>
      )}

      {typ === 'embed' && (
        <>
          <div className="sm:col-span-2">
            <span className={labelClassName()}>embedAllow (optional)</span>
            <div className="flex flex-col gap-2">
              {DEFAULT_EMBED_ALLOW_SUFFIXES.map((suffix) => (
                <label key={suffix} className="flex items-center gap-2 text-sm text-fg-2">
                  <input
                    type="checkbox"
                    checked={values.embedAllow.includes(suffix)}
                    onChange={() => toggleEmbedAllow(suffix)}
                  />
                  {suffix}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-fg-3">
              {values.embedAllow.length === 0
                ? 'Keine Auswahl — Standard-Allowlist (alle erlaubten Hosts) gilt.'
                : 'Nur ausgewählte Domains sind für diese URL erlaubt.'}
            </p>
          </div>

          {!isEmbedEnabled() && (
            <div className="sm:col-span-2 rounded-gs39-sm border border-border-1 bg-bg-3 px-3 py-2 text-xs text-fg-2">
              Hinweis: Einbettungen werden im Viewer nur angezeigt, wenn{' '}
              <code className="font-mono">NEXT_PUBLIC_EMBED_ENABLED=true</code> gesetzt ist
              (Dev-Server ggf. neu starten).
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function isLinkEmbedFormValid(typ: 'link' | 'embed', values: LinkEmbedFormValues): boolean {
  const quelle = values.quelle.trim()
  if (!quelle || !isValidHttpsUrl(quelle)) {
    return false
  }
  if (typ === 'embed') {
    const allowlist = resolveEmbedAllowlist({
      embedAllow: values.embedAllow.length > 0 ? values.embedAllow : undefined,
    })
    if (!isEmbedUrlAllowed(quelle, allowlist)) {
      return false
    }
  }
  return true
}
