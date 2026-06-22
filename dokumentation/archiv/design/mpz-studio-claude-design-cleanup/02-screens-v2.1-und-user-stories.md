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
| S14 | Sphere-Kalibrierung (Hinweis) | Link + JSON-Rückschreibung | info-panel |
| S15 | Tab Dialog | Figuren, Segmente, Gruppen, Bubble | empty, filled, segment-form |
| S16 | Tab Dialog-Audio (Station) | WAV-Liste, Upload, fehlende Clips | list, warning |

### Globale Module (Sidebar)

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S17 | Dialog-Audio (global) `/mpz/studio/dialog-audio` | Alle Dialog-Stationen, Clips | list, missing |
| S18 | Coach `/mpz/studio/coach` | CRUD coach-messages | empty, list, form |
| S19 | Embeds & Links `/mpz/studio/embeds` | Globale Allowlist + Medien-Übersicht | list, edit-suffix |
| S20 | Hub-Karte `/mpz/studio/hub` | Slug↔Slot, Akzente, Lucide-Icons | grid, edit |
| S21 | Brand & Design `/mpz/studio/brand` | Logos, Maskottchen, Motive | upload, preview |
| S22 | Deploy `/mpz/studio/deploy` | Env, QR, Token, validate-all, Vorschau-Links | ok, warnings |

### Sonstiges

| # | Route / Screen | Zweck |
|---|----------------|-------|
| S23 | `/mpz/studio/ingest` | Deep-Link → öffnet Medien-Modal |
| S24 | `/mpz/unlock` | Zugang vor Studio (optional im Paket) |

---

## S1 — Studio-Shell (Ist)

**Layout:** Links Sidebar (240 px), rechts Content mit Top-Bar.

**Sidebar (Ist — 9 Einträge, flach):**

- Dashboard
- Stationen
- Medien hochladen (öffnet Modal, keine Route)
- Dialog-Audio
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

## S11–S14 — Hotspots

- **Medien-Hotspot:** mediumId, x/y oder yaw/pitch, icon, iconSize
- **Dialog-Hotspot:** action dialog, mascot, mascotSize
- Kalibrier-Buttons: Flat → S13; Sphere → S14 (externe Besucher-App)

---

## S15 — Dialog-Editor

Nur Stationen mit `dialog` (z. B. `daz`, `pc-raum`). Mock: `07-referenz-station-daz.json`.

Blöcke:

- Figuren (Frieda/Otto)
- Segmente (id, rolle, text, quelle, gruppe, tail)
- Gruppen
- Sprechblasen-Layout (`bubble`: y, x, maxWidth, fontSize, followPan)

**Design-Aufgabe:** Komplexität reduzieren — Sub-Tabs, Accordion, oder Wizard?

---

## S17 vs. S16 — Dialog-Audio (Redundanz)

- **S16:** Tab innerhalb Station Detail
- **S17:** eigener Sidebar-Eintrag, alle Stationen

**Design-Aufgabe:** Ein klares Modell — nicht beides gleichwertig.

---

## S18 — Coach

Trigger-Typen:

- `hub-milestone` (+ milestone 0–12)
- `hub-complete`
- `room-first` (+ slug)

Felder: id, mascot (frieda/otto/duo), placement, text, modes (fest/heft).

Mock: `13-coach-messages-auszug.json`.

---

## S19 — Embeds & Links

- Globale Domain-Suffixe (`14-embed-allowlist.json`)
- Übersicht aller embed/link-Medien über Stationen

---

## S20 — Hub-Karte

- Slug ↔ Hub-Slot (12 feste Slots)
- Akzentfarbe pro Station
- Lucide-Icon-Picker

Slot-Geometrie bleibt Code — read-only Hinweis.

---

## S21 — Brand & Design

Upload-Bereiche: Logos, Maskottchen, optionale Motive unter `public/brand/`.

---

## S22 — Deploy

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
| Hotspot Sphere | S5 → S11 → S14 → S3 |
| Dialog pflegen | S5 → S15 → S16 → S3 |
| Coach-Nachricht | S18 → S3 |
| Deploy prüfen | S22 → S3 |
| Validierung fehlgeschlagen | S3 (error + rollback) |

---

## Zustände pro Screen (Pflicht)

Jeder Screen S1–S22 mindestens:

- **Empty** — wenig/noch keine Daten
- **Filled** — realistische Mock-Daten
- **Error** — Validierungs- oder Upload-Fehler
- **Loading** — wo asynchron (Save, Upload, validate-all)
