# Epic: MPZ Studio v3 — Visual Polish

**Milestone:** [MPZ Studio v3 Visual Polish](https://github.com/flxln/schulnavigator/milestone/13) (GitHub #13)
**Status:** offen (2026-06-23)
**GitHub Epic:** [#205](https://github.com/flxln/schulnavigator/issues/205)
**Parent:** abgeschlossenes Epic [#195](./epic-mpz-studio-ui-cleanup.md) (IA & Navigation)

**Design-Quellen:** [SCREEN-MATRIX.md](../archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md) · [studio_precision/DESIGN.md](../archiv/design/mpz-studio-claude-design-cleanup/mockups/stitch_mpz_studio_shell_dashboard/studio_precision/DESIGN.md) · [mockups/README.md](../archiv/design/mpz-studio-claude-design-cleanup/mockups/README.md)

---

## Ziel

MPZ Studio soll sich wie ein **zusammenhängendes GS39-Werkzeug** anfühlen (Mockup-Niveau S4–S11, S13–S14) — **nur visuell**, ohne neue Domänen-Features und ohne IA-Änderungen.

Epic #195 lieferte Navigation und Flows; dieses Epic liefert **Tonal Layering**, Cards, Sidebar/Top-Bar, verfeinerte Tabellen/Formulare.

---

## Scope — drin / draußen

| In Epic | **Nicht** in Epic (bewusst ausgeschlossen) |
|---------|---------------------------------------------|
| Design-Tokens & Primitives (Cards, Sidebar-Item, Inputs) | **Markdown-WYSIWYG** für Text-Medien |
| Shell, Dashboard, Stationen-Grid, Detail-Header | **Dialog-Bubble visueller Editor** (Drag auf Raum) |
| Medien/Hotspots/Dialog Layout (S8–S15) | **Hub Mockup-Karten-Grid** — Hub bleibt **Tabelle** (`hub-panel.tsx`) |
| Save-Validate Zustände (S3) | YouTube-Pflege im Studio (ADR-004) |
| Kalibrier-Shells S13/S14 | Batch-Import `auftraggeber/` |
| Design & Hub: Tabs + Tabelle/Brand-Panel optisch | Directus / Lehrkräfte-Admin |
| Coach / Embeds / Deploy optisch | IA-Änderungen (NAVIGATION-SOLL frozen) |
| Unlock (optional D3) | Hub-Slot-Geometrie (bleibt Code) |

**Leitplanken (ADR-022):** nur `development`, Guard, `writeStations` — **kein** Verhalten/API ändern.

---

## Verbindliche Entscheidungen

| Thema | Entscheidung |
|-------|--------------|
| Farben | GS39 (`gs39-tokens.css`) — keine MD3-Stitch-Palette |
| Shell-Referenz | `s11_hotspots_empty` (Gold-Mockup) |
| Hub-Tab | **Tabelle beibehalten** — kein Karten-Grid aus S19 |
| Bubble-Layout | JSON-Felder im Formular — kein Drag-Editor |
| Text-Medien | Datei-Upload/Replace wie v2.1 — kein Markdown-Editor |

---

## Übersicht Unterissues

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#205` | MPZ Studio v3 — Visual Polish | `design`, `tech` | — |
| Unterissue | `#206` | A1: Studio Design Tokens + Primitives | `design`, `tech`, `blocker` | — — **erledigt** (2026-06-23, Post-Mortem unten) |
| Unterissue | `#207` | A2: Shell visuell (Sidebar, Top-Bar) | `design`, `tech` | #206 — **erledigt** (2026-06-23, Post-Mortem unten) |
| Unterissue | `#208` | A3: Save-Validate & Dashboard | `design`, `tech` | #206 — **erledigt** (2026-06-24, Post-Mortem unten) |
| Unterissue | `#209` | B1: Stationen-Grid Kacheln | `design`, `tech` | #207 |
| Unterissue | `#210` | B2: Station-Detail-Header | `design`, `tech` | #207 — **erledigt** (2026-06-23, Post-Mortem unten) |
| Unterissue | `#211` | C1: Stammdaten-Formular | `design`, `tech` | #210 — **erledigt** (2026-06-23, Post-Mortem unten) |
| Unterissue | `#212` | C2: Medien Empty, Tabelle, Modal | `design`, `tech` | #210 — **erledigt** (2026-06-24, Post-Mortem unten) |
| Unterissue | `#215` | C3: Medien bearbeiten | `design`, `tech` | #212 — **erledigt** (2026-06-24, Post-Mortem unten) |
| Unterissue | `#213` | C4: Hotspots Empty, Tabelle, Formulare | `design`, `tech` | #210 — **erledigt** (2026-06-24, Post-Mortem unten) |
| Unterissue | `#216` | C5: Dialog-Tab Layout | `design`, `tech` | #210 — **erledigt** (2026-06-24, Post-Mortem unten) |
| Unterissue | `#218` | D1: Design & Hub (Tabs, Tabelle, Brand) | `design`, `tech` | #207 |
| Unterissue | `#219` | D2: Coach, Embeds, Deploy | `design`, `tech` | #207 |
| Unterissue | `#233` | D2b: Deploy-Tab UX (Buttons, Feedback) | `design`, `tech` | #230 — **erledigt** (2026-06-24) |
| Unterissue | `#220` | D3: Unlock-Screen (optional) | `design`, `tech` | #206 |
| Unterissue | `#214` | E1: Flat-Kalibrierung Layout | `design`, `tech` | #210 |
| Unterissue | `#217` | E2: Sphere-Kalibrierung Layout | `design`, `tech` | #210 |

**Empfohlene Reihenfolge:** A1 (`blocker`) → A2 ∥ A3 → B1/B2 → C2/C4/C5/C1/C3 → D → E

**Pilot (~1 Woche):** #206 → #207 → #209 → #213

---

## Phasen (Detail)

### Phase A — Foundation

| Issue | Screens | Dateien |
|-------|---------|---------|
| #206 | Querschnitt | `mpz-studio-tokens.css`, `mpz-form-primitives.ts`, `mpz-card.tsx` — **erledigt** (2026-06-23) |
| #207 | S1, S11 | `studio-shell.tsx` |
| #208 | S3, S4 | `save-validate-panel.tsx`, `studio-dashboard.tsx` — **erledigt** (2026-06-24) |

### Phase B — Stationen

| Issue | Screens | Dateien |
|-------|---------|---------|
| #209 | S5 | `station-grid.tsx` |
| #210 | S6 | `station-detail-shell.tsx` — **erledigt** (2026-06-23) |

### Phase C — Station Detail

| Issue | Screens | Dateien |
|-------|---------|---------|
| #211 | S7 | `station-stammdaten-form.tsx`, `station-raumbild-upload.tsx` |
| #212 | S8, S9 | `station-medien-table.tsx`, `media-ingest-modal.tsx` — **erledigt** (2026-06-24) |
| #215 | S10 | `station-medium-edit-form.tsx` — **erledigt** (2026-06-24) |
| #213 | S11, S12 | `station-hotspots-table.tsx`, `station-hotspot-*-form.tsx` — **erledigt** (2026-06-24) |
| #216 | S15 | `station-dialog-panel.tsx`, `station-dialog-segment-audio-row.tsx` — **erledigt** (2026-06-24) |

### Phase D — Querschnitt

| Issue | Screens | Dateien |
|-------|---------|---------|
| #218 | S19, S20 | `design-page-shell.tsx`, `hub-panel.tsx`, `brand-panel.tsx` |
| #219 | S17, S18, S21 | `coach-panel.tsx`, `embeds-panel.tsx`, `deploy-tab.tsx` |
| [#233](https://github.com/flxln/schulnavigator/issues/233) | S21 (Bug) | `deploy-tab.tsx`, `globals.css` — sichtbare Buttons + Inline-Feedback — **erledigt** 2026-06-24 |
| #220 | S24 | `app/mpz/unlock/page.tsx` |

### Phase E — Kalibrierung

| Issue | Screens | Dateien |
|-------|---------|---------|
| #214 | S13 | `flat-calib-shell.tsx`, `flat-hotspot-calib.tsx` |
| #217 | S14 | `sphere-calib-shell.tsx`, `sphere-hotspot-calib.tsx` |

---

## Akzeptanzkriterien (Epic)

**Querschnitt**

- [ ] Sidebar: 240px, Navy, Gruppenlabels, aktiver Streifen (wie `s11`)
- [ ] Top-Bar: 56px, weiß, Breadcrumb + Save
- [ ] Cards: 8px Radius, Border, Padding 20px
- [ ] Hub-Tab: **Tabelle** — optisch poliert, kein Grid-Layout

**Screens**

- [ ] S4, S5, S6, S8–S11, S15, S13/S14 — Screenshot-Abgleich mit Mockups

**Technik**

- [ ] `cd app && npm test && npm run build` grün
- [ ] NAV-01–07 unverändert
- [ ] `validate:tokens` grün

---

## Aufwand (grob)

| Paket | Personentage |
|-------|--------------|
| Pilot (#206–#207, #209, #213) | 5–7 |
| MVP (A + B + C) | 12–16 |
| Voll (+ D + E) | 18–22 |

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| #205 | https://github.com/flxln/schulnavigator/issues/205 |
| #233 | https://github.com/flxln/schulnavigator/issues/233 |
| #206–#220 | siehe Tabelle oben |

---

## Verwandte Dokumente

- [epic-mpz-studio-ui-cleanup.md](./epic-mpz-studio-ui-cleanup.md) — IA (#195) ✅
- [mpz-studio.md](../spezifikationen/mpz-studio.md) — Phasierung v3b
- [NAVIGATION-SOLL.md](../archiv/design/mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md)

## Fortschritt

- [x] #206 A1 Studio Tokens + Primitives (Post-Mortem: [post-mortem-206-2026-06-23.md](../reviews/post-mortem/post-mortem-206-2026-06-23.md))
- [x] #207 A2 Shell visuell (Post-Mortem: [post-mortem-207-2026-06-23.md](../reviews/post-mortem/post-mortem-207-2026-06-23.md))
- [x] #208 A3 Save-Validate & Dashboard (Post-Mortem: [post-mortem-208-2026-06-24.md](../reviews/post-mortem/post-mortem-208-2026-06-24.md))
- [x] #209 B1 Stationen-Grid Kacheln (Post-Mortem: [post-mortem-209-2026-06-23.md](../reviews/post-mortem/post-mortem-209-2026-06-23.md))
- [x] #210 B2 Station-Detail-Header (Post-Mortem: [post-mortem-210-2026-06-23.md](../reviews/post-mortem/post-mortem-210-2026-06-23.md))
- [x] #211 C1 Stammdaten-Formular (Post-Mortem: [post-mortem-211-2026-06-23.md](../reviews/post-mortem/post-mortem-211-2026-06-23.md))
- [x] #212 C2 Medien Empty, Tabelle, Modal (Post-Mortem: [post-mortem-212-2026-06-24.md](../reviews/post-mortem/post-mortem-212-2026-06-24.md))
- [x] #215 C3 Medien bearbeiten (Post-Mortem: [post-mortem-215-2026-06-24.md](../reviews/post-mortem/post-mortem-215-2026-06-24.md))
- [x] #213 C4 Hotspots Empty, Tabelle, Formulare (Post-Mortem: [post-mortem-213-2026-06-24.md](../reviews/post-mortem/post-mortem-213-2026-06-24.md))
- [x] #216 C5 Dialog-Tab Layout (Post-Mortem: [post-mortem-216-2026-06-24.md](../reviews/post-mortem/post-mortem-216-2026-06-24.md))
- [x] #233 D2b Deploy-Tab UX — sichtbare Buttons, Inline-Feedback Bahn B (Nacharbeit #230, 2026-06-24)

### Archiv — Plan-Härtung #208 (2026-06-24)

Plan (lokal): `.cursor/plans/#208_save_dashboard_6181c036.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-208-save-dashboard-2026-06-23.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-208-save-dashboard-2026-06-23.md)

- ✅ **S3:** `saveInProgress` im Context; `SaveValidatePanel` mit 4 Zuständen (Custom-Tint-Banner, running-first); `SaveControl` Spinner + Label-Split.
- ✅ **S4:** Dashboard auf `MpzCard`; Hero ok/error; Skeleton nur Initial-Load; Refresh gated bei `saveInProgress`.
- 🔁 **Folge-Scope (bewusst offen):** `MpzCard` `validation`→`accented`-Rename (Carry-over aus #209-Scope-Reduktion); `validate:coach` / `welcome-hub.wav` Altschuld beim Build.

### Archiv — Plan-Härtung #216 (2026-06-24)

Plan (lokal): `.cursor/plans/#216_dialog_s15_25cdfb74.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-216-dialog-s15-2026-06-24.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-216-dialog-s15-2026-06-24.md)

- ✅ **Shell:** Dialog-Tab auf `MpzCard` (`station-detail-shell.tsx`).
- ✅ **S15 Panel:** Zentrierter Empty-State, `mpzButton`, Segment-Tabelle mit Empty-`<tr colSpan={7}>`, Akkordeon Chevron rechts, semantische Fehlerfarben.
- ✅ **Audio-Zeile:** `mpzButton`, Upload-Label mit Dateiname, expandable Sub-Zeile beibehalten (#200).
- ✅ **Kind-Formulare:** Segment/Gruppe/Bubble auf `mpzButtonClassName`.
- 🔁 **Folge-Scope (bewusst offen):** `min-h-11` auf `<td>` wirkungslos (1a#2); leere Tabelle sichtbar während Segment-Add (1a#4); Badge-Label „ok“ vs. Mockup „Clip ok“; WAV-Orphans-Hinweis beim Dialog-Löschen (1b#4).
- 🔁 **Domänen-Feature (nicht #205):** Text-only-Dialog-Segmente — [#221](https://github.com/flxln/schulnavigator/issues/221) (Phase 5; Pilot Lesewelt).

### Archiv — Plan-Härtung #213 (2026-06-24)

Plan (lokal): `.cursor/plans/#213_hotspots_s11_s12_3d33134e.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-213-codepraxis.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-213-hotspots-s11-s12-2026-06-24.md)

- ✅ **S11 Tabelle:** Viewer-Label, Empty als `<tr colSpan={5}>`, `mpzButton`, `min-h-11`, Sphere-Label „Sphere kalibrieren“.
- ✅ **S12 Add-Form:** 2 Typ-Karten mit State-Merge (kein Datenverlust), disabled-Karte + CTA, `MpzFormAlert`, Kalibrier-Link ohne `target="_blank"`.
- ✅ **S12 Edit/Icon:** `mpzButton` primary/secondary, semantische Fehler (`text-error`, `MpzFormAlert`).
- ✅ **Shell:** Hotspots-Tab auf `MpzCard` umgestellt.
- 🔁 **Folge-Scope (bewusst offen):** Icon-Reset 2. Hotspot (1a#3), Icon-Fetch-Dedupe (1a#4); Error-Notice-Card/Tab-Fehlerpunkte (#210/#211); S14-Layout (#217).

### Archiv — Plan-Härtung #215 (2026-06-24)

Plan (lokal): `.cursor/plans/#215_medien_s10_f0de95f7.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-215-codepraxis.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-215-medien-s10-2026-06-24.md)

- ✅ **S10 Inline-Panel:** `station-medium-edit-form.tsx` — `mpzButtonClassName`, Drop-Zone Replace (Drag+Click, `preventDefault`), hervorgehobener Block, Microcopy Pfad/Kollision.
- ✅ **Asset-Feld:** `medium-asset-upload-field.tsx` — `mpzButton` secondary, `MpzFormAlert` für Upload-Fehler.
- ✅ **S8 editing-Chrome:** `station-medien-table.tsx` — Active-Row am ersten `<td>` (`border-l-accent`), „Wird bearbeitet“ in Aktionsspalte.
- 🔁 **Folge-Scope (bewusst offen):** `text.thumbnail`-Spec-Diskrepanz; YouTube→upload-Zwischenzustand; Error-Notice-Card/Tab-Fehlerpunkte (#210/#211).

### Archiv — Plan-Härtung #212 (2026-06-24)

Plan (lokal): `.cursor/plans/#212_medien_s8_s9_82f1fd9d.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-212-codepraxis.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-212-medien-s8-s9-2026-06-23.md)

- ✅ **S8 Tabelle:** Spalten `ID|Typ|…`, Empty als `<tr colSpan={5}>`, `MpzFormAlert`, `mpzButton`.
- ✅ **S9 Modal:** Typ-Karten-Grid 2×3, Footer-Kontrakt (`formId`/`onStateChange`), kontrollierter File-State, Pfad-Vorschau.
- ✅ **MpzModal:** Passives `footer`-Slot; `hidden open:flex` statt barem `flex` (Dialog sonst dauerhaft sichtbar).
- ✅ **Shell:** Medien-Tab-Panel auf `MpzCard` umgestellt.
- 🔁 **Folge-Scope (bewusst offen):** Inline-Bearbeiten (S10) → [#215](https://github.com/flxln/schulnavigator/issues/215) ✅; Error-Notice-Card/Tab-Fehlerpunkte aus #210/#211.

### Archiv — Plan-Härtung #211 (2026-06-23)

Plan (lokal): `.cursor/plans/#211_stammdaten_s7_3da62894.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-211-2026-06-23.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-211-stammdaten-s7-2026-06-23.md)

- ✅ **Primitives:** `station-stammdaten-form.tsx` auf `mpz-form-primitives` migriert; Slug als `<input readOnly>` mit `read-only:bg-bg-2`.
- ✅ **Raumbild S7:** Upload-Zonen mit konditionalem Grid; 360°-Zone nur bei `equirectangular` (Authoring-UX, kein Datenvertrag).
- ✅ **Shell:** Stammdaten-Tab-Panel auf `MpzCard` umgestellt.
- 🔁 **Folge-Scope (bewusst offen):** Error-Notice-Card, Tab-Fehlerpunkte, numerischer Fehler-Count — Report-Vertragserweiterung (aus #210 übernommen).

### Archiv — Plan-Härtung #210 (2026-06-23)

Plan (lokal): `.cursor/plans/#210_detail-header_1c8b4463.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-210-2026-06-23.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-210-detail-header-2026-06-23.md)

- ✅ **Health-Ampel:** Import aus `mpz-studio-health.ts` statt lokaler toter `brand-*`-Klassen.
- ✅ **Issues-Zeile:** Neutrales health-getriebenes Label („Prüfung fehlgeschlagen“ / „Bitte prüfen“) statt numerischem Fehler-Count; Fallback „Validierungsstatus nicht verfügbar“ bei `error` ohne Issues.
- ✅ **Tabs:** `mpzTabLinkClassName` (Underline, `font-semibold` in beiden Zuständen); Tab-Panels bewusst v2.1 (#211+).
- 🔁 **Folge-Scope (#211):** Error-Notice-Card, Tab-Fehlerpunkte und numerischer Fehler-Count brauchen Report-Vertragserweiterung.

### Archiv — Plan-Härtung #209 (2026-06-23)

Plan (lokal): `.cursor/plans/#209_stationen-grid_744818b2.plan.md` · Pre-Mortems [1a](../reviews/pre-mortem/pre-mortem-1a-209-2026-06-23.md) / [1b](../reviews/pre-mortem/pre-mortem-1b-209-stationen-grid-2026-06-23.md)

- ✅ **Positiver Befund (1b):** API-Fehlercode-Vertrag von `GET /api/mpz/validate` ist konsistent & Spec-konform (SCREAMING_SNAKE_CASE, kein `error`-vs-`code`-Widerspruch). Datenfluss über `useStudioValidation()` eliminiert den Doppel-Fetch zuverlässig — Epic-Leitplanke „keine API-Änderung" eingehalten.
- 🔁 **Neues Shared-Modul `mpz-studio-health.ts`** (Ampel `healthDotClass`/`healthLabel`, aus `studio-shell.tsx` extrahiert) — **#210** (Detail-Header) und spätere Health-Consumer sollen dieses Modul importieren statt erneut zu kopieren. Behebt zugleich die toten `brand-green`/`brand-red`-Klassen (s. nächster Punkt).
- 📉 **Scope-Reduktion in #209:** `MpzCard` `validation`→`accented`-Rename + Dashboard-Anpassung (Carry-over aus #208) **aus #209 herausgenommen** → eigener kleiner Folge-PR (orthogonal zum Grid; Grid nutzt `default`-Variante). Medien/Hotspot-Zähler pro Kachel **entfernt** (mockup-näher).
- ⚠️ **Offener Latent-Bug (nicht #209):** tote `text-brand-green`/`text-brand-red`-KPI-Zahlen in `studio-dashboard.tsx` (Z. 238–247) — bekannter Bug, bewusst separater Fix, um Scope-Creep zu vermeiden.
