# MPZ Studio v2.1 — Screens und User-Stories

**Verbindlicher UI-Scope für Claude Design (Cleanup).** Alle umgesetzten Module — nicht nur v0.

Quellen: [mpz-studio.md](../../spezifikationen/mpz-studio.md), [mpz-studio-ui.md](../../ideen/archiv/mpz-studio-ui.md), Ist-Code in `app/components/mpz-studio/`.

---

## Screen-Inventar

### Shell & Querschnitt

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S1 | Studio-Shell | Sidebar, Top-Bar, Dev-Badge, Save-CTA | default, narrow (Sidebar collapsed) |
| S2 | Plan-A-Banner | Fallback-Hinweis CLI | visible |
| S3 | Save & Validate Panel | Ergebnis nach globalem Save | idle, running, success, rollback-error |
| S4 | Dashboard | Gesamt-Validierung, Stationen mit Fehlern | ok, errors, loading |

### Stationen

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S5 | Stationen-Grid | 12 Slugs wählen | partial, all-ok |
| S6 | Station Detail — Header | Titel, Hub-Nr, Viewer-Badge, Ampel, Vorschau-Link | flat, 360°, issues |
| S7 | Tab Stammdaten | titel, beschreibung, viewer, Raumbild-Upload | flat, equirectangular |
| S8 | Tab Medien | Tabelle, Bearbeiten, Löschen, Hinzufügen | empty, list, editing |
| S9 | Medien-Upload-Modal | 6 Typen, Drag & Drop, Pfade | default, link/embed, error |
| S10 | Medien bearbeiten | Inline-Formular / PATCH, Datei ersetzen, Thumbnail | metadata, replace-file |
| S11 | Tab Hotspots | Flat + 360° Tabellen, CRUD, Kalibrier-Links | empty, list, dialog-hotspot |
| S12 | Hotspot anlegen/bearbeiten | Formular + Icon-Upload | medium, dialog |
| S13 | Flat-Kalibrierung `/mpz/calib/flat/[slug]` | Klick → x/y | idle, marker, applied |
| S14 | Sphere-Kalibrierung `/mpz/calib/sphere/[slug]` | Klick → yaw/pitch; Layout wie S13 | idle, marker, applied, startblick |
| S15 | Tab Dialog | **alle Stationen** — Empty „Dialog hinzufügen“ oder Segment-Zeilen (Text + Audio), Gruppen, Bubble | no-dialog, empty-segments, filled, row-upload-play |

### Globale Module (Sidebar)

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S17 | Coach `/mpz/studio/coach` | CRUD coach-messages | empty, list, form |
| S18 | Embeds & Links `/mpz/studio/embeds` | Globale Allowlist + Medien-Übersicht | list, edit-suffix |
| S19 | Hub-Karte → Tab in `/mpz/studio/design` | Slug↔Slot, Akzente, Lucide-Icons | grid, edit |
| S20 | Brand & Design → Tab in `/mpz/studio/design` | Logos, Maskottchen, Motive | upload, preview |
| S21 | Deploy `/mpz/studio/deploy` | Env, QR, Token, validate-all, Vorschau-Links | ok, warnings |

**Entfällt im Cleanup:** ehem. S17 Dialog-Audio global, ehem. S16 Tab dialog-audio — siehe [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md).

**Zusammengelegt (Entscheidung 3.5):** S19 (Hub) + S20 (Brand) leben unter **einer** Route `/mpz/studio/design` als zwei Tabs; `/mpz/studio/hub` + `/mpz/studio/brand` werden Redirects. Inhalt/Mockups bleiben, der Container ändert sich — siehe [`ROADMAP.md`](./ROADMAP.md).

### Sonstiges

| # | Route / Screen | Zweck |
|---|----------------|-------|
| S23 | `/mpz/studio/ingest` | Deep-Link → öffnet Medien-Modal |
| S24 | `/mpz/unlock` | Zugang vor Studio (optional im Paket) |

---

## S1 — Studio-Shell (Ist)

**Layout:** Links Sidebar (240 px), rechts Content mit Top-Bar.

**Sidebar (Ist — 9 Einträge, einer überflüssig ⚠️):**

- Dashboard
- Stationen
- Medien hochladen (öffnet Modal, keine Route)
- Dialog-Audio ← **entfällt** (kein globaler Inhalt)
- Coach
- Embeds & Links
- Hub-Karte
- Brand & Design
- Deploy

**Top-Bar:** Seitentitel, Button „Speichern & Validieren“ (disabled wenn nichts zu speichern).

**Badge:** `Nur lokal · development`

**Design-Aufgabe:** Gruppierung, ggf. Sekundär-Navigation, klare Hierarchie.

---

## S4 — Dashboard

- Karte **Validierung** — grün/rot, Checks
- **Stationen mit Problemen** — Slug, Fehler, Link
- Quick-Actions: Alle Stationen, ggf. Deploy-Hinweis

---

## S5 — Stationen-Grid

**Kachel** (Daten: `10-hub-stationen-liste.json`):

- Hub-Nr, Titel, slug
- Badge Viewer: `flat` | `360°`
- Ampel: ok / warn / error
- Klick → Station Detail

Grid: 3 Spalten Desktop, 2 Tablet, 1 Mobil.

---

## S7 — Stammdaten

| Feld | UI |
|------|-----|
| `slug` | read-only |
| `titel` | Text |
| `beschreibung` | Textarea |
| `viewer` | Select flat / equirectangular |
| `bild` | Upload Flat-Panorama + Pfad |
| `panorama360` | Upload 360° (wenn equirectangular) |

---

## S8–S10 — Medien

**Tabelle:** id, typ, untertitel, quelle (gekürzt), Aktionen (Bearbeiten, Entfernen).

**Hinzufügen:** Modal S9 — Typ-Karten für alle 6 Typen.

**Bearbeiten:** Metadaten-PATCH; v2.1: Datei ersetzen, Thumbnail/Poster-Upload.

**Bedingte Felder:** siehe `05-typendefinitionen.md`.

---

## S11–S14 — Hotspots & Kalibrierung

- **Medien-Hotspot:** mediumId, x/y (flat) oder yaw/pitch (360°), icon, iconSize
- **Dialog-Hotspot:** action dialog, mascot, mascotSize
- Kalibrier-Buttons: Flat → **S13**; Sphere → **S14** (eigener MPZ-Screen, symmetrisch zu Flat)

Details Sphere: [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md)

### S13 — Flat-Kalibrierung (umgesetzt)

Route `/mpz/calib/flat/[slug]`. Nur `viewer: flat`.

### S14 — Sphere-Kalibrierung (geplant, Option A)

Route **`/mpz/calib/sphere/[slug]`** — noch **nicht** implementiert.

- Gleiche Shell-Idee wie Flat: Top-Bar, Tabs Hotspots / Startblick, Panorama links, Seitenpanel rechts
- APIs bestehend: `POST /api/mpz/hotspots/sphere`, `POST /api/mpz/view/sphere`
- **Ersetzt** primären Workflow über `/raum/{slug}?hotspot-calib=1`

---

## S15 — Dialog-Editor (alle Stationen)

**Tab Dialog ist bei jeder Station sichtbar** — auch ohne bestehenden `dialog`-Block in `stations.json`.

### Zustand A — Kein Dialog (`no-dialog`)

Station z. B. `klassenzimmer` (Mock: `06-referenz-station-klassenzimmer.json`).

- Erklärung: Maskottchen-Dialog optional pro Raum
- CTA: **Dialog hinzufügen** → `dialog`-Block anlegen (Figuren vorausgewählt, leere `segmente[]`)
- Kein Wechsel zu anderer Station nötig

> **Hinweis (Pre-Mortem 1a #1):** Anlegen braucht einen **neuen** `POST /api/mpz/stations/[slug]/dialog`; der bestehende `PATCH` deckt das nicht ab. Feature, kein Refactor — siehe [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md).

### Zustand B — Dialog vorhanden (`filled`)

Station z. B. `daz`, `pc-raum` (Mock: `07-referenz-station-daz.json`).

**Domänenregel:** Jedes Segment = ein Sprechertext + eine Audiodatei — alles in **einer Tabellenzeile**.

Blöcke im Tab Dialog:

- Figuren (Frieda/Otto)
- **Segmente** — Tabelle: Nr, ID, Rolle, **Sprechertext**, Gruppe, **Audio** (Status, Abspielen), Aktionen (**Upload**, Bearbeiten, Löschen)
- Gruppen (optional)
- Sprechblasen-Layout (`bubble`)

Vollständige Spezifikation: [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md)

**Design-Aufgabe:** Gruppen/Bubble als Sub-Bereich; Segment-Tabelle zentral — kein separater Audio-Tab.

## S17 — Coach

Trigger-Typen:

- `hub-milestone` (+ milestone 0–12)
- `hub-complete`
- `room-first` (+ slug)

Felder: id, mascot (frieda/otto/duo), placement, text, modes (fest/heft).

Mock: `13-coach-messages-auszug.json`.

---

## S18 — Embeds & Links

- Globale Domain-Suffixe (`14-embed-allowlist.json`)
- Übersicht aller embed/link-Medien über Stationen

---

## S19 — Hub-Karte

- Slug ↔ Hub-Slot (12 feste Slots)
- Akzentfarbe pro Station
- Lucide-Icon-Picker

Slot-Geometrie bleibt Code — read-only Hinweis.

---

## S20 — Brand & Design

Upload-Bereiche: Logos, Maskottchen, optionale Motive unter `public/brand/`.

---

## S21 — Deploy

- `.env.local`-Werte anzeigen/ändern
- QR-Generierung, Token-Rotation (Dry-Run)
- validate-all (stations + coach + tokens)
- Vorschau-Links (Raum, Eintritt, Hub)

---

## User-Story → Screen-Mapping

| Story | Screens |
|-------|---------|
| Medien ingestieren | S5 → S8 → S9 → S3 → Vorschau |
| Medien bearbeiten/ersetzen | S5 → S8 → S10 → S3 |
| Hotspot Flat | S5 → S11 → S13 → S3 |
| Hotspot Sphere | S5 → S11 → **S14** → S3 |
| Dialog pflegen | S5 → S15 (Segment-Zeile: Text + Audio) → S3 |
| Coach-Nachricht | S17 → S3 |
| Deploy prüfen | S21 → S3 |
| Validierung fehlgeschlagen | S3 (error + rollback) |

---

## Zustände pro Screen (Pflicht)

Jeder Screen S1–S21 mindestens:

- **Empty** — wenig/noch keine Daten
- **Filled** — realistische Mock-Daten
- **Error** — Validierungs- oder Upload-Fehler
- **Loading** — wo asynchron (Save, Upload, validate-all)
