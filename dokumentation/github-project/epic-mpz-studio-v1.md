# Epic: MPZ Studio v1 — Station-Detail & Content-Pflege (ADR-022)

**Milestone:** MPZ Studio v1 (Post-Fest, Juli 2026)
**Status:** in Arbeit (Branch `mpz-studio-v1`, 2026-06-17) · **#159**, **#160**, **#161**, **#162**, **#166** erledigt
**Parent:** Epic [#144](https://github.com/flxln/schulnavigator/issues/144) (v0 abgeschlossen, [PR #156](https://github.com/flxln/schulnavigator/pull/156))

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#158` | MPZ Studio v1 — Station-Detail & Content-Pflege (ADR-022) | `tech` | — |
| Unterissue | `#159` | Station-Detail-Shell (Route, Tabs, Grid-Link) | `tech`, `blocker` | v0 #151 | ✓ |
| Unterissue | `#160` | Stammdaten-Editor (`titel`, `beschreibung`, `viewer`) | `tech` | #159, v0 #146 | ✓ |
| Unterissue | `#161` | Medien-Tabelle auf Station-Detail | `tech` | #159, v0 #147 | ✓ |
| Unterissue | `#162` | Hotspots-Tabelle auf Station-Detail | `tech` | #159, v0 #149 | ✓ |
| Unterissue | `#165` | Hotspot anlegen (Medium, Koordinaten, Icon, iconSize) | `tech` | #161, #162, #166 (Icon-Picker) | |
| Unterissue | `#166` | Hotspot-Icon-Ingest (`/media/{slug}/icons/`) | `tech` | #161 | ✓ |
| Unterissue | `#167` | Hotspot bearbeiten (PATCH) | `tech` | #165 | |
| Unterissue | `#163` | Dialog-Audio-Tab pro Station | `tech` | #159, v0 #148 |
| Unterissue | `#164` | Doku & Epic-Abschluss | `tech`, `documentation` | #159–#163, #165–#167 |

## Ziel

v0 liefert Shell, Dashboard, Stations-Grid, Medien-Ingest, Dialog-Audio, Hotspot-Kalibrierung und Save & Validate. **v1 schließt die Lücke zwischen Grid und Einzelwerkzeugen:** pro Station eine Detail-Ansicht mit Tabs (Stammdaten, Medien, Hotspots, Dialog-Audio), sodass Felder wie `beschreibung` ohne JSON-Editor geändert werden können.

Plan A (CLI/JSON) bleibt Fallback. Leitplanken aus ADR-022 unverändert: nur `NODE_ENV=development`, nie Coolify, kein Git aus dem Studio.

## Scope v1 — drin / draußen

| In v1 | Nicht v1 (v2) |
|-------|----------------|
| Route `/mpz/studio/stationen/[slug]` + Tab-Navigation | Coach-Editor (`coach-messages.json`) |
| S4 Stammdaten: `titel`, `beschreibung`, `viewer` (read-only: `slug`, `bild`, `panorama360`) | Brand & Design (Logos, Tokens) |
| S5 Medien-Tabelle (read + Links zu Ingest, Entfernen mit Bestätigung) | Hub-Karte / Slot-Geometrie |
| S7 Hotspots-Tabelle + Kalibrier-Links + Entfernen (#162) | Deploy-Tab (Env, QR, Token) |
| S7 Hotspot anlegen + bearbeiten: Koordinaten, `icon`, `iconSize` (#165, #167) | Dialog-Hotspots (`action: dialog`) |
| Hotspot-Icon-Upload nach `/media/{slug}/icons/` (#166) | Raumbild-Upload |
| S10 Dialog-Audio pro Station (aus Grid/Detail, nicht nur globale Seite) | Raumbild-Upload |
| Grid-Kachel → Detail (zusätzlich zu Vorschau/Kalibrieren) | `embed-allowlist.json`-Extraktion |
| API `PATCH` Stammdaten + bestehende Write-Pipeline (`writeStations`, `withMpzWriteLock`) | Config-Extraktion (`hub-slug-map`, `station-icons`) |

## GitHub-Links

| Issue | URL |
|-------|-----|
| #158 | https://github.com/flxln/schulnavigator/issues/158 |
| #159 | https://github.com/flxln/schulnavigator/issues/159 |
| #160 | https://github.com/flxln/schulnavigator/issues/160 |
| #161 | https://github.com/flxln/schulnavigator/issues/161 |
| #162 | https://github.com/flxln/schulnavigator/issues/162 |
| #163 | https://github.com/flxln/schulnavigator/issues/163 |
| #164 | https://github.com/flxln/schulnavigator/issues/164 |
| #165 | https://github.com/flxln/schulnavigator/issues/165 |
| #166 | https://github.com/flxln/schulnavigator/issues/166 |
| #167 | https://github.com/flxln/schulnavigator/issues/167 |

## Design-Referenz

| Screen | Prototyp | Spec |
|--------|----------|------|
| S4 Stammdaten | `studio-stationen.jsx` | [02-v0-screens-und-user-stories.md](../design/mpz-studio-claude-design/02-v0-screens-und-user-stories.md) § S4 |
| S5 Medien | `studio-stationen.jsx` | § S5–S6 |
| S7 Hotspots | `studio-stationen.jsx` | § S7; Detail: [Hotspot-Editor-Spec](../projektmanagement/2026-06-17-mpz-studio-hotspot-editor-spezifikation.md) |

Interaktiv: [mpz-studio-prototype/MPZ Studio.html](../design/mpz-studio-claude-design/version_1/mpz-studio-prototype/MPZ%20Studio.html)

## Technische Leitplanken

- **Schreiben:** wie v0 über `createMpzContentIo()` → `writeStations({ strict: true, postValidate: true })` innerhalb `withMpzWriteLock`.
- **Dirty-State:** nach erfolgreichem Patch `markMpzStudioDirty()` → globaler Button „Speichern & Validieren“ (bereits #150).
- **Stammdaten-Patch:** neues `lib/mpz-station-stammdaten.ts` + `PATCH /api/mpz/stations/[slug]/stammdaten` (nur erlaubte Felder, `slug` unveränderlich).
- **Lesen:** `GET /api/mpz/stations/[slug]` für Detail-Formular.
- **Viewer-Wechsel:** Warnung wenn `viewer` geändert wird und falsche Hotspot-Art belegt ist (Hinweis, kein Auto-Migrate in v1).

## Kontext

- [ADR-022](../adr/022-mpz-studio-internes-ingest-tool.md)
- [2026-06-16-mpz-studio-spezifikation.md](../projektmanagement/2026-06-16-mpz-studio-spezifikation.md) (IA Gesamtbild)
- [2026-06-17-mpz-studio-hotspot-editor-spezifikation.md](../projektmanagement/2026-06-17-mpz-studio-hotspot-editor-spezifikation.md) (#165–#167)
- [epic-mpz-studio.md](./epic-mpz-studio.md) (v0, abgeschlossen)
- Implementierungsplan: [.cursor/plans/mpz_studio_v1.plan.md](../../.cursor/plans/mpz_studio_v1.plan.md)

## Checkliste (Epic)

- [x] GitHub Epic + Unterissues angelegt (#158–#164)
- [x] Station-Detail-Route + Tab-Shell (#159)
- [x] Grid verlinkt auf Detail (#159)
- [x] Stammdaten-Editor (inkl. `beschreibung`) (#160)
- [x] Medien-Tabelle (#161)
- [x] Hotspots-Tabelle (#162)
- [ ] Hotspot anlegen inkl. Koordinaten, Icon, iconSize (#165)
- [x] Hotspot-Icon-Ingest (#166)
- [ ] Hotspot bearbeiten (#167)
- [ ] Dialog-Audio-Tab (#163)
- [x] Tests + `npm run build` (#159)
- [ ] Doku (`fuer-entwickler.md`, Spec-Notiz) (#164)
