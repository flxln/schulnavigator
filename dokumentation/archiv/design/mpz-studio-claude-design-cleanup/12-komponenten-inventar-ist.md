# Komponenten-Inventar — Ist-Implementierung

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
| `sphere-hotspot-calib-overlay.tsx` | S14 (Ist: Overlay auf `/raum`) |
| `sphere-calib-shell.tsx` | **S14 (geplant)** — analog `flat-calib-shell` |
| `sphere-hotspot-calib.tsx` | **S14 (geplant)** — eingebettetes Panel |
| `station-dialog-panel.tsx` | S15 |
| `station-dialog-segment-form.tsx` | S15 |
| `station-dialog-gruppe-form.tsx` | S15 |
| `station-dialog-bubble-form.tsx` | S15 |
| `dialog-audio-panel.tsx` | ~~S16/S17~~ → in S15 Segment-Zeile integrieren |
| `dialog-audio-status-badges.tsx` | S15 (Segment-Zeile) |

---

## Globale Module

| Komponente | Screen |
|------------|--------|
| `coach-panel.tsx` | S17 |
| `coach-message-form.tsx` | S17 |
| `coach-audio-status-badges.tsx` | S17 |
| `embeds-panel.tsx` | S18 |
| `hub-panel.tsx` | S19 |
| `brand-panel.tsx` | S20 |
| `deploy-tab.tsx` | S21 |

---

## Routen (Pages)

| Route | Datei |
|-------|-------|
| `/mpz/studio` | `app/app/mpz/studio/page.tsx` |
| `/mpz/studio/stationen` | `app/app/mpz/studio/stationen/page.tsx` |
| `/mpz/studio/stationen/[slug]` | `app/app/mpz/studio/stationen/[slug]/page.tsx` |
| `/mpz/studio/ingest` | `app/app/mpz/studio/ingest/page.tsx` |
| `/mpz/studio/dialog-audio` | ~~global~~ → **entfernen** im Cleanup |
| `/mpz/studio/coach` | `app/app/mpz/studio/coach/page.tsx` |
| `/mpz/studio/embeds` | `app/app/mpz/studio/embeds/page.tsx` |
| `/mpz/studio/hub` | `app/app/mpz/studio/hub/page.tsx` |
| `/mpz/studio/brand` | `app/app/mpz/studio/brand/page.tsx` |
| `/mpz/studio/deploy` | `app/app/mpz/studio/deploy/page.tsx` |
| `/mpz/calib/flat/[slug]` | `app/app/mpz/calib/flat/[slug]/page.tsx` |
| `/mpz/calib/sphere/[slug]` | **geplant** — siehe [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md) |
| Layout | `app/app/mpz/studio/layout.tsx` |

---

## Anzahl Komponenten

42 Dateien in `mpz-studio/` (inkl. Tests) — Redesign-Ziel: weniger sichtbare Fragmentierung, klarere Shell.
