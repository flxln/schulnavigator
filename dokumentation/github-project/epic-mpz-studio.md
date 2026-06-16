# Epic: MPZ Studio v0 — internes Dev-only-Ingest-Tool (ADR-022)

**Milestone:** MPZ Studio v0 (fällig 22.06.2026)
**Status:** geplant (optionaler Plan B; Plan A bleibt Pflicht + Fallback)

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#144` | MPZ Studio v0 — internes Dev-only-Ingest-Tool (ADR-022) | `tech` | — |
| Unterissue | `#145` | Guard + Route-Skeleton `/mpz/studio` (Dev-only) | `tech`, `blocker` | — |
| Unterissue | `#146` | `lib/mpz-content-io`: atomarer Schreib-Layer + Tests | `tech`, `blocker` | — |
| Unterissue | `#147` | Medien-Datei-Ingest (audio/video/foto/text) + Upload-Regeln | `tech` | #146 |
| Unterissue | `#148` | Dialog-Audio-Ingest (WAV-Konvention + Segment-Verknüpfung) | `tech` | #146 |
| Unterissue | `#149` | Flat-Kalibrier-Route `/mpz/calib/flat/{slug}` + 360°-Rückschreibung | `tech` | #146 |
| Unterissue | `#150` | Validierungs-Vertrag nach Save (Struktur + Asset) | `tech` | #146 |
| Unterissue | `#151` | Dashboard, Stationen-Liste, Vorschau-Links + Entwickler-Doku | `tech` | #145 |

## Ziel

Schmales, **MPZ-internes** Pflege-UI als optionaler **Plan B** zum bereits umgesetzten CLI/JSON-Workflow (Plan A). Macht Medien-Ingest, Dialog-Audio und Hotspot-Kalibrierung komfortabler als die CLI — schreibt aber nur lokale Repo-Dateien (`stations.json` + Assets), nur bei `NODE_ENV=development`, **nie** auf Coolify. Scope = **v0-DoD** aus der Spec.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #144 | https://github.com/flxln/schulnavigator/issues/144 |
| #145 | https://github.com/flxln/schulnavigator/issues/145 |
| #146 | https://github.com/flxln/schulnavigator/issues/146 |
| #147 | https://github.com/flxln/schulnavigator/issues/147 |
| #148 | https://github.com/flxln/schulnavigator/issues/148 |
| #149 | https://github.com/flxln/schulnavigator/issues/149 |
| #150 | https://github.com/flxln/schulnavigator/issues/150 |
| #151 | https://github.com/flxln/schulnavigator/issues/151 |

## Kontext

- ADR: [022-mpz-studio-internes-ingest-tool.md](../adr/022-mpz-studio-internes-ingest-tool.md) (ergänzt ADR-003 „kein Custom-Admin")
- Spec + v0-DoD: [2026-06-16-mpz-studio-spezifikation.md](../projektmanagement/2026-06-16-mpz-studio-spezifikation.md)
- **Claude Design v1 (SE 13):** [mpz-studio-claude-design/version_1/mpz-studio-prototype/](../design/mpz-studio-claude-design/version_1/README.md) — interaktiver Prototyp `MPZ Studio.html`
- DoD abgeleitet aus zwei SE-15-Plan-Reviews (Codex + GLM-5.1)

## Leitplanken

- `/mpz/*` + `/api/mpz/*` nur bei `NODE_ENV=development`; in Production 404. **Nie** auf Coolify.
- `assertMpzStudioAccess()` in **jeder** API-Route — `app/middleware.ts` deckt `/api/*` nicht ab.
- Kein Git/Publish aus dem Studio; lokal → validate → `git commit` → push → Coolify.
- Plan A (CLI/JSON) bleibt Pflicht + Fallback; Studio darf den Projekttag 24.–26.06. nicht blockieren.

## Scope-Abgrenzung

**Draußen (Post-Fest v1/v2):** Coach, Embed-Allowlist-Extraktion, Brand, Hub-Slug-Map, Station-Icons, GS39-Tokens, Deploy-Tab, Config-Extraktion nach JSON.

## Risiken / Folge-Tasks

- **Orphan-Files (Folge-Task zu #147, Pre-Mortem Gemini #3):** Der Ingest kompensiert bei JSON-Fehler (`unlink`), aber ein Prozessabsturz **zwischen** Datei-Write und JSON-Write kann verwaiste Dateien in `public/media/` hinterlassen, die langfristig die Kollisions-Logik (`-2`, `-3`) verschmutzen. Geplant, **nicht in #147 gebaut:** kleines `clean-orphans`-CLI-Skript, das `public/media/`-Dateien gegen `data/stations.json` abgleicht und nicht referenzierte Dateien meldet/löscht. Single-Operator (ADR-022) macht das v0 unkritisch.

## Checkliste (Epic)

- [x] Claude Design v0 (SE 13) — Prototyp in `dokumentation/design/mpz-studio-claude-design/version_1/mpz-studio-prototype/` (2026-06-16)
- [x] #145 Guard + Route-Skeleton (Dev-only, 401/ok/404 getestet)
- [x] #146 `lib/mpz-content-io` (atomar, `.bak`, Pre-Validate, Tests, CLI-DRY)
- [x] #147 Medien-Ingest + Upload-Regeln (Magic-Byte via `file-type`/Größe/Normalisierung/Kollision; `lib/mpz-upload-rules.ts` + `lib/mpz-medium-ingest.ts`, API `POST /api/mpz/media/ingest`, Mini-UI `/mpz/studio/ingest`, CLI-DRY)
- [ ] #148 Dialog-Audio-Ingest
- [ ] #149 Flat-Kalibrier-Route + 360°-Rückschreibung
- [ ] #150 Validierungs-Vertrag (Struktur + Asset; `validate:tokens` raus; debounced)
- [ ] #151 Dashboard/Liste/Vorschau + Doku in `fuer-entwickler.md`
- [ ] Prod-Build verifiziert: 404 auf `/mpz/*` + `/api/mpz/*`, Build grün ohne `any`
