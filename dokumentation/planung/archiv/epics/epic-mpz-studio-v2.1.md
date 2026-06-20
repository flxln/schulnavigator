# Epic: MPZ Studio v2.1 — Medien-Datei ersetzen (ADR-022)

**Milestone:** [MPZ Studio v2.1](https://github.com/flxln/schulnavigator/milestone/10) (GitHub #10)
**Status:** abgeschlossen (2026-06-20) · gemerged nach `main` ([PR #194](https://github.com/flxln/schulnavigator/pull/194), Commit `4f7accc`)
**GitHub Epic:** [#186](https://github.com/flxln/schulnavigator/issues/186)
**Parent:** Epic [#170](./epic-mpz-studio-v2.md) (v2 abgeschlossen)

**Domänen-Übersicht:** [mpz-studio-ui.md](../../../ideen/archiv/mpz-studio-ui.md) · **Spec:** [mpz-studio.md](../../../spezifikationen/mpz-studio.md)

---

## Ziel

v2 liefert Medien-**Anlegen** (Ingest), **Metadaten-PATCH** und **Löschen** — aber für `audio`, `video`, `foto` und `text` ist der **Datei-Inhalt** im Studio nicht änderbar (`quelle` read-only in der UI; kein Replace-Endpoint). Redakteure müssen heute Dateien manuell im Dateisystem tauschen oder Medium löschen + neu anlegen (Hotspot-`mediumId` geht verloren).

**v2.1 schließt diese Lücke:** Datei ersetzen bei gleicher `medium.id` (Hotspot-Referenzen bleiben), plus Upload für `thumbnail`/`poster` statt manueller Pfad-Eingabe.

Leitplanken unverändert (ADR-022): nur `NODE_ENV=development`, `assertMpzStudioAccess` auf jeder Route, `writeStations` mit Backup + `postValidate`, kein Git aus dem Studio.

**Bewusst nicht v2.1 (bleibt v3):** Markdown-Inline-Editor, YouTube-`quelle`-Pflege, Batch-Import `auftraggeber/`.

---

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#186` | MPZ Studio v2.1 — Medien-Datei ersetzen (ADR-022) | `tech` | — |
| Unterissue | `#187` | Domain + API: `replaceStationMediumFile` | `tech`, `blocker` | — |
| Unterissue | `#188` | UI: „Datei ersetzen“ im Medien-Editor | `tech` | #187 |
| Unterissue | `#189` | Thumbnail- und Poster-Upload (Medien) | `tech` | #187 |
| Unterissue | `#190` | Doku & Epic-Abschluss v2.1 | `tech`, `documentation` | #187–#189 |

**Empfohlene Reihenfolge:** Domain/API → UI Datei ersetzen ∥ Thumbnail/Poster (parallel möglich) → Coach #191–#193 → Doku (#190)

---

## Scope v2.1 — drin / draußen

| In v2.1 | Nicht v2.1 |
|---------|------------|
| Datei ersetzen für `audio`, `video` (`videoSource: upload`), `foto`, `text` | `link`, `embed` (keine lokale Datei) |
| Gleiche `medium.id`; `quelle` aktualisieren wenn sich Endung ändert | YouTube (`videoSource: youtube`) — UI ohne Replace |
| Alte Datei löschen wenn nach JSON-Update unreferenziert | Markdown-WYSIWYG (v3) |
| Thumbnail-/Poster-Upload → Pfad in JSON | YouTube-URL/ID im Studio (v3 + ADR-004) |
| Unit-/Route-Tests, Guard wie bestehende `/api/mpz/*` | Lehrkräfte-Admin (Directus #47) |

---

## Technische Spezifikation

### 1 — Domain: `replaceStationMediumFile`

**Modul:** `app/lib/mpz-medium-replace.ts`

**Signatur:**

```ts
export interface ReplaceMediumFileInput {
  slug: string
  mediumId: string
  source: IngestSource
  originalName: string
}

export interface ReplaceMediumFileResult {
  medium: Medium
  quelle: string
  previousQuelle: string
  fileReplaced: boolean
  previousFileDeleted: boolean
  mtime: string | null
  validation?: MpzValidationReport
}
```

**Ablauf:**

1. Station + Medium laden; `typ` ∈ `{ audio, video, foto, text }`.
2. Bei `video`: `videoSource === 'youtube'` → `FIELD_NOT_ALLOWED`.
3. Upload validieren (`validateUpload` mit `typ` des Mediums).
4. Zielpfad: in-place oder neuer Pfad bei Endungswechsel/Shared-`quelle`.
5. `medium.id` **unverändert**; optional `videoSource: 'upload'` setzen falls fehlend.
6. `writeStations` mit `postValidate: true`, `touchedSlugs: [slug]`.
7. Bei JSON-Fehler: Kompensation (neue Datei entfernen, alte nicht anfassen).

**Fehlercodes:** `NOT_FOUND`, `FIELD_NOT_ALLOWED`, `VALIDATION` (via `MpzUploadError`), `IO`.

### 2 — API

| Methode | Route | Body |
|---------|-------|------|
| `POST` | `/api/mpz/stations/[slug]/medien/[mediumId]/file` | `multipart/form-data`: `file` (Pflicht) |

Antwort `200`: `{ medium, quelle, previousQuelle, fileReplaced, previousFileDeleted, mtime, validation? }`.

### 3 — UI: Datei ersetzen

In `StationMediumEditForm`: Abschnitt **„Datei ersetzen“** für `audio` | `video` (upload) | `foto` | `text`.

### 4 — Thumbnail- und Poster-Upload

**Domain:** `app/lib/mpz-medium-asset-upload.ts`

| Feld | Erlaubter `typ` des Mediums | Upload-Regeln | Zielordner |
|------|----------------------------|---------------|------------|
| `thumbnail` | alle `MediumTyp`-Werte | `foto`-Regeln (`UPLOAD_RULES.foto`) | `/media/{slug}/fotos/` |
| `poster` | nur `video` | `foto`-Regeln | `/media/{slug}/fotos/` |

**API:**

| Methode | Route | Body |
|---------|-------|------|
| `POST` | `/api/mpz/stations/[slug]/medien/[mediumId]/thumbnail` | `file` |
| `POST` | `/api/mpz/stations/[slug]/medien/[mediumId]/poster` | `file` (nur `typ: video`) |

### 5 — Tests

- Unit: `mpz-medium-replace.test.ts`, `mpz-medium-asset-upload.test.ts`
- Route: `…/file/route.test.ts`, `…/thumbnail/route.test.ts`, `…/poster/route.test.ts`

### 6 — Doku (#190)

- [mpz-studio.md](../../../spezifikationen/mpz-studio.md) — Phasierung v2.1
- [mpz-studio-ui.md](../../../ideen/archiv/mpz-studio-ui.md) — Matrix-Zeile „Datei ersetzen“
- [fuer-entwickler.md](../../../../anleitungen/fuer-entwickler.md) — API-Tabelle
- [lokal-testen-und-anschauen.md](../../../../anleitungen/lokal-testen-und-anschauen.md) — Testroute

---

## Akzeptanzkriterien (Epic)

**Funktional**

- [x] Ersetzen einer MP3 für bestehendes Audio-Medium: gleiche `medium.id`, Hotspot zeigt weiter auf dasselbe Medium.
- [x] Ersetzen mit anderer Endung (`.txt` → `.md`): `quelle` in JSON korrekt, alte Datei entfernt wenn unreferenziert.
- [x] Video mit `videoSource: youtube`: kein Datei-Replace in UI; API lehnt ab.
- [x] Thumbnail-Upload setzt `thumbnail`-Pfad ohne manuelles Tippen. (#189)
- [x] Poster-Upload nur bei `typ: video`. (#189)

**Technik**

- [x] Alle neuen Routes mit `withMpzStudioAccess`.
- [x] `npm run test` und `npm run build` grün.
- [x] Kein `any` in neuem Code.

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| #186 | https://github.com/flxln/schulnavigator/issues/186 |
| #187 | https://github.com/flxln/schulnavigator/issues/187 |
| #188 | https://github.com/flxln/schulnavigator/issues/188 |
| #189 | https://github.com/flxln/schulnavigator/issues/189 |
| #190 | https://github.com/flxln/schulnavigator/issues/190 |

---

## Kontext

- [ADR-022](../../../adr/022-mpz-studio-internes-ingest-tool.md)
- [epic-mpz-studio-v2.md](./epic-mpz-studio-v2.md) (#171 Medien PATCH)
- Domain: `lib/mpz-medium-replace.ts`, `lib/mpz-medium-asset-upload.ts`
- Upload-Regeln: `lib/mpz-upload-rules.ts`, Ingest: `lib/mpz-medium-ingest.ts`

## Checkliste (Epic)

- [x] GitHub Milestone „MPZ Studio v2.1“ angelegt (#10)
- [x] Epic + Unterissues auf GitHub (#186–#190)
- [x] Domain + API (#187)
- [x] UI Datei ersetzen (#188)
- [x] Thumbnail/Poster-Upload (#189)
- [x] Doku & Epic-Abschluss (#190) — umgesetzt 2026-06-20, Post-Mortem [post-mortem-190-2026-06-20.md](../../../reviews/post-mortem/post-mortem-190-2026-06-20.md)
- [x] Merge Branch `mpz-studio-v2.1` → `main` — [PR #194](https://github.com/flxln/schulnavigator/pull/194)
