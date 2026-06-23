'use client'

import {
  mpzFieldClassName,
  mpzLabelClassName,
} from '@/components/mpz-studio/mpz-form-primitives'
import { MediumAssetUploadField } from '@/components/mpz-studio/medium-asset-upload-field'
import {
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

export type ThumbnailAssetUploadProps = {
  uploadDisabled: boolean
  uploadDisabledHint?: string
  onPickFile: (file: File) => void
  busy: boolean
  uploadError?: string | null
}

export type MediumLinkEmbedFieldsProps = {
  typ: 'link' | 'embed'
  slug: string
  globalSuffixes: readonly string[]
  values: LinkEmbedFormValues
  onChange: <K extends keyof LinkEmbedFormValues>(
    key: K,
    value: LinkEmbedFormValues[K],
  ) => void
  idPrefix: string
  thumbnailAssetUpload?: ThumbnailAssetUploadProps
}

export function defaultLinkEmbedFormValues(
  typ: 'link' | 'embed',
  globalSuffixes: readonly string[],
): LinkEmbedFormValues {
  return {
    untertitel: '',
    thumbnail: '',
    quelle: '',
    openInExternal: false,
    embedAllow: typ === 'embed' ? [...globalSuffixes] : [],
  }
}

export function MediumLinkEmbedFields({
  typ,
  slug,
  globalSuffixes,
  values,
  onChange,
  idPrefix,
  thumbnailAssetUpload,
}: MediumLinkEmbedFieldsProps) {
  const quelleTrimmed = values.quelle.trim()
  const httpsOk = quelleTrimmed === '' || isValidHttpsUrl(quelleTrimmed)
  const embedAllowlist =
    typ === 'embed'
      ? resolveEmbedAllowlist(
          {
            embedAllow:
              values.embedAllow.length > 0 ? values.embedAllow : undefined,
          },
          globalSuffixes,
        )
      : []
  const embedUrlOk =
    typ !== 'embed' ||
    quelleTrimmed === '' ||
    isEmbedUrlAllowed(quelleTrimmed, embedAllowlist)

  const quelleInvalid =
    quelleTrimmed.length > 0 && (!httpsOk || (typ === 'embed' && !embedUrlOk))

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
        <label htmlFor={`${idPrefix}-quelle`} className={mpzLabelClassName()}>
          Quelle (https)
        </label>
        <input
          id={`${idPrefix}-quelle`}
          type="url"
          required
          value={values.quelle}
          onChange={(e) => onChange('quelle', e.target.value)}
          aria-invalid={quelleInvalid || undefined}
          className={`${mpzFieldClassName()} font-mono text-xs${quelleInvalid ? ' border-error' : ''}`}
        />
        {quelleTrimmed && !httpsOk && (
          <p role="alert" className="mt-1 text-xs text-error">
            Muss eine gültige https-URL sein.
          </p>
        )}
        {typ === 'embed' && quelleTrimmed && httpsOk && !embedUrlOk && (
          <p role="alert" className="mt-1 text-xs text-error">
            URL liegt nicht auf einer erlaubten Embed-Domain.
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-untertitel`} className={mpzLabelClassName()}>
          Untertitel (optional)
        </label>
        <input
          id={`${idPrefix}-untertitel`}
          type="text"
          value={values.untertitel}
          onChange={(e) => onChange('untertitel', e.target.value)}
          className={mpzFieldClassName()}
        />
      </div>

      {thumbnailAssetUpload ? (
        <MediumAssetUploadField
          field="thumbnail"
          slug={slug}
          value={values.thumbnail}
          onPathChange={(path) => onChange('thumbnail', path)}
          uploadDisabled={thumbnailAssetUpload.uploadDisabled}
          uploadDisabledHint={thumbnailAssetUpload.uploadDisabledHint}
          onPickFile={thumbnailAssetUpload.onPickFile}
          busy={thumbnailAssetUpload.busy}
          idPrefix={idPrefix}
          uploadError={thumbnailAssetUpload.uploadError}
        />
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-thumbnail`} className={mpzLabelClassName()}>
            thumbnail (optional)
          </label>
          <input
            id={`${idPrefix}-thumbnail`}
            type="text"
            value={values.thumbnail}
            onChange={(e) => onChange('thumbnail', e.target.value)}
            placeholder="/media/…"
            className={`${mpzFieldClassName()} font-mono text-xs`}
          />
          <p className="mt-1 text-xs text-fg-3">
            Pfad unter <code className="font-mono">/media/{slug}/</code> oder anderem öffentlichen
            Pfad.
          </p>
        </div>
      )}

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
            <span className={mpzLabelClassName()}>embedAllow (optional)</span>
            <div className="flex flex-col gap-2">
              {globalSuffixes.map((suffix) => (
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

export function isLinkEmbedFormValid(
  typ: 'link' | 'embed',
  values: LinkEmbedFormValues,
  globalSuffixes: readonly string[],
): boolean {
  const quelle = values.quelle.trim()
  if (!quelle || !isValidHttpsUrl(quelle)) {
    return false
  }
  if (typ === 'embed') {
    const allowlist = resolveEmbedAllowlist(
      {
        embedAllow: values.embedAllow.length > 0 ? values.embedAllow : undefined,
      },
      globalSuffixes,
    )
    if (!isEmbedUrlAllowed(quelle, allowlist)) {
      return false
    }
  }
  return true
}
