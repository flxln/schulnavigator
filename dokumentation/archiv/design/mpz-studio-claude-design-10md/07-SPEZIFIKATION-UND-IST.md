# Spezifikation und Ist-Komponenten

Kurzfassung aus [`dokumentation/spezifikationen/mpz-studio.md`](../../spezifikationen/mpz-studio.md). Volltext im Repo.

---

## Leitplanken

| Regel | Umsetzung |
|-------|-----------|
| Nur für MPZ | Route `/mpz/*`, nur `NODE_ENV=development` |
| Lokal schreiben | API → Repo-Dateien; **kein** Studio auf Coolify |
| Single Source of Truth | Validatoren nach jedem Save |
| Plan A Fallback | CLI + JSON bleibt kritisch |

---

## Informationsarchitektur (Soll laut Spec)

```
/mpz/studio
├── Dashboard
├── Stationen
│   └── /stationen/[slug]
│       ├── Stammdaten
│       ├── Medien
│       ├── Hotspots
│       ├── Dialog
│       └── Vorschau
├── Coach
├── Dialog-Audio
├── Embeds & Links
├── Brand & Design
├── Hub-Karte
└── Deploy
```

**Cleanup-Aufgabe:** Ist-Navigation (9 flache Punkte, Dialog-Audio doppelt) an sinnvolle IA anpassen — Spec als Referenz, nicht als starres Korsett.

---

## Medien (`medien[]`) — alle 6 Typen

| `typ` | Pflichtfelder | Upload/Auto |
|-------|---------------|-------------|
| `audio` | id, untertitel, quelle | → `media/{slug}/audio/` |
| `video` | videoSource, quelle | MP4 oder YouTube |
| `foto` | quelle | → `fotos/` |
| `text` | quelle | → `texte/` |
| `link` | quelle (HTTPS), openIn | URL |
| `embed` | quelle, embedAllow[] | Allowlist-Check |

Zusatz v2.1: Datei ersetzen, Thumbnail/Poster-Upload.

---

## Hotspots

- **Medien-Hotspot:** mediumId, x/y (flat) oder yaw/pitch (360°)
- **Dialog-Hotspot:** action dialog, mascot
- **Flat-Kalibrierung:** `/mpz/calib/flat/{slug}`
- **Sphere:** `?hotspot-calib=1` in Besucher-App

---

## Dialog (daz, pc-raum)

| Block | Inhalt |
|-------|--------|
| `figuren[]` | frieda, otto |
| `segmente[]` | id, rolle, text, quelle, gruppe, tail |
| `gruppen[]` | Gruppentexte |
| `bubble` | y, x, maxWidth, fontSize, followPan |

WAV: `01-frieda.wav` → `quelle: "/api/dialog/{slug}/01-frieda.wav"`

---

## Coach (global)

| Trigger | Zusatz |
|---------|--------|
| `hub-milestone` | milestone 0–12 |
| `hub-complete` | — |
| `room-first` | slug |

Felder: id, mascot, placement, text, modes.

---

## Querschnitt-Module

| Modul | Datei(en) |
|-------|-----------|
| Embeds | `app/data/embed-allowlist.json` |
| Hub | `app/data/hub-slug-map.json`, Akzente, Icons |
| Brand | `app/public/brand/` |
| Deploy | Env, QR, Token, validate-all |

---

## Phasierung (Kontext)

- **v0–v2.1:** umgesetzt (2026-06-20)
- **v3 Polish:** optional (Inline-Markdown, visuelle Bubble-Position, Batch-Import)

Dieses Design-Paket adressiert **Aufräumen der v2.1-UI**, nicht v3-Features.


---

Mapping **React-Komponente → Screen** (Stand 2026-06-22).  
Pfad: `app/components/mpz-studio/`

Dient Claude Design als Referenz, was heute existiert — **nicht** als Vorgabe für die neue Struktur.

---

## Shell & Querschnitt

| Komponente | Screen |
|------------|--------|
| `studio-shell.tsx` | S1 — Sidebar, Top-Bar, Save-Button |
| `plan-a-banner.tsx` | S2 |
| `save-validate-panel.tsx` | S3 |
| `studio-validation-context.tsx` | (State für S3, S4) |
| `studio-dashboard.tsx` | S4 |

---

## Stationen

| Komponente | Screen |
|------------|--------|
| `station-grid.tsx` | S5 |
| `station-detail-shell.tsx` | S6 — Header, Tabs |
| `station-stammdaten-form.tsx` | S7 |
| `station-raumbild-upload.tsx` | S7 (Raumbilder) |
| `station-medien-table.tsx` | S8 |
| `station-medium-edit-form.tsx` | S10 |
| `medium-link-embed-fields.tsx` | S9/S10 (link, embed) |
| `medium-asset-upload-field.tsx` | S10 (Datei ersetzen, Thumbnail) |
| `media-ingest-modal.tsx` | S9 |
| `media-ingest-modal-context.tsx` | S9 (globaler Opener) |
| `media-ingest-form.tsx` | S9 |
| `mpz-studio-ingest-opener.tsx` | S23 (Deep-Link) |
| `media-link-embed-form.tsx` | S9 (link/embed) |
| `station-hotspots-table.tsx` | S11 |
| `station-hotspot-add-form.tsx` | S12 |
| `station-hotspot-edit-form.tsx` | S12 |
| `hotspot-icon-upload.tsx` | S12 |
| `flat-calib-shell.tsx` | S13 |
| `flat-hotspot-calib.tsx` | S13 |
| `flat-startpan-calib.tsx` | S13 (Startblick) |
| `station-dialog-panel.tsx` | S15 |
| `station-dialog-segment-form.tsx` | S15 |
| `station-dialog-gruppe-form.tsx` | S15 |
| `station-dialog-bubble-form.tsx` | S15 |
| `dialog-audio-panel.tsx` | S16 |
| `dialog-audio-status-badges.tsx` | S16 |

---

## Globale Module

| Komponente | Screen |
|------------|--------|
| `dialog-audio-panel.tsx` | S17 (wiederverwendet) |
| `coach-panel.tsx` | S18 |
| `coach-message-form.tsx` | S18 |
| `coach-audio-status-badges.tsx` | S18 |
| `embeds-panel.tsx` | S19 |
| `hub-panel.tsx` | S20 |
| `brand-panel.tsx` | S21 |
| `deploy-tab.tsx` | S22 |

---

## Routen (Pages)

| Route | Datei |
|-------|-------|
| `/mpz/studio` | `app/app/mpz/studio/page.tsx` |
| `/mpz/studio/stationen` | `app/app/mpz/studio/stationen/page.tsx` |
| `/mpz/studio/stationen/[slug]` | `app/app/mpz/studio/stationen/[slug]/page.tsx` |
| `/mpz/studio/ingest` | `app/app/mpz/studio/ingest/page.tsx` |
| `/mpz/studio/dialog-audio` | `app/app/mpz/studio/dialog-audio/page.tsx` |
| `/mpz/studio/coach` | `app/app/mpz/studio/coach/page.tsx` |
| `/mpz/studio/embeds` | `app/app/mpz/studio/embeds/page.tsx` |
| `/mpz/studio/hub` | `app/app/mpz/studio/hub/page.tsx` |
| `/mpz/studio/brand` | `app/app/mpz/studio/brand/page.tsx` |
| `/mpz/studio/deploy` | `app/app/mpz/studio/deploy/page.tsx` |
| `/mpz/calib/flat/[slug]` | `app/app/mpz/calib/flat/[slug]/page.tsx` |
| Layout | `app/app/mpz/studio/layout.tsx` |

---

## Anzahl Komponenten

42 Dateien in `mpz-studio/` (inkl. Tests) — Redesign-Ziel: weniger sichtbare Fragmentierung, klarere Shell.
